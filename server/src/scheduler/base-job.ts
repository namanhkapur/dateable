import { Tags } from "hot-shots";
import _ from "lodash";
import PgBoss, { Job, JobWithMetadata } from "pg-boss";
import { Context } from "../config/context";
import { logError } from "../utils/error-handler";

// For some reason this isn't typed within PG Boss
export interface MonitorJobResponse<Data, Result> {
  data: {
    failed: boolean;
    retryCount: number;
    response?: Result;
    request: Job<Data>;
  };
}

export interface JobSubscription {
  subscriptionId: string;
}

export class JobErrorResult {
  constructor(
    // If retryable is true and this is returned as a result of a job that enables retries,
    // then the job will attempt to retry its execution assuming it has not reached the retry limit
    readonly retryable?: boolean,
    readonly error?: Error
  ) {}
}

type JobInstance<Data> = {
  context: Context;
  pgBossJob: JobWithMetadata<Data>;
};

type BaseJobResponse = {
  success: boolean;
};

export abstract class BaseJob<Data> {
  protected abstract readonly newJobCheckIntervalSeconds: number;

  protected readonly retryLimit?: number;
  protected readonly baseRetryDelaySeconds?: number;
  /**
   * If set then the initial backoff is baseRetryDelaySeconds, and double each time with a random offset.
   */
  protected readonly retryBackoff?: boolean;
  protected readonly expiresInMinutes?: number;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected readonly singletonKey = (data: Data): string | undefined =>
    undefined;
  protected readonly singletonHours: number | undefined;

  protected readonly teamSize: number | undefined;
  protected readonly teamConcurrency: number | undefined;

  // TODO what if someone puts a userid or something similar in here. Metric cardinality will explode. Maybe don't allow
  // or add automatically to metrics.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getExtraMetadata(data: Data): Tags {
    return {};
  }

  protected abstract executeJob(
    context: Context,
    data: Data
  ): Promise<any | JobErrorResult>;

  /**
   * This is used as the name by pgboss to determine which callback to run.
   * Generally speaking any parameters to the job constructor should probably be
   * reflected here.
   */
  public get queueName(): string {
    return this.jobName;
  }

  /**
   * A friendly name that is primarily used to group different jobs together
   * for the purpose of logging and tracing. OneTimeJobs will generally
   * use this as the queue name too. See {@link BaseJob#getQueueName}
   */
  public get jobName(): string {
    return this.constructor.name;
  }

  public async subscribe(pgBoss: PgBoss): Promise<JobSubscription> {
    const subscriptionId = await pgBoss.subscribe(
      this.queueName,
      {
        includeMetadata: true,
        newJobCheckIntervalSeconds: this.newJobCheckIntervalSeconds,
        teamConcurrency: this.teamConcurrency ?? 1,
        teamSize: this.teamSize ?? 1,
      },
      this.run
    );

    return { subscriptionId };
  }

  protected readonly run = async (
    pgBossJob: JobWithMetadata<Data>
  ): Promise<BaseJobResponse> => {
    const job = this.makeJobInstance(pgBossJob);
    return this.runJobInstance(job);
  };

  private runJobInstance = async (
    job: JobInstance<Data>
  ): Promise<BaseJobResponse> => {
    const { context } = job;

    let result = null;
    try {
      result = await this.executeJob(context, job.pgBossJob.data);
    } catch (error) {
      // This will not throw the error under any circumstances (a side effect is that thrown errors are not retryable).
      return this.handleCaughtError(job, error);
    }

    // This will throw an error if the job is retryable.
    return this.handleResult(job, result);
  };

  private makeJobInstance = (
    pgBossJob: JobWithMetadata<Data>
  ): JobInstance<Data> => {
    const job = {
      context: Context.create(),
      pgBossJob,
    };
    this.setupMetadata(job);
    return job;
  };

  private setupMetadata = (job: JobInstance<Data>) => {
    const metadata = {
      ...this.getExtraMetadata(job.pgBossJob.data),
      jobName: this.jobName,
      queueName: this.queueName,
    };
    job.context.addMetadata(metadata);
  };

  private getJobMetricTags = (job: JobInstance<Data>): Tags => ({
    retryCount: job.pgBossJob.retrycount.toString(),
    jobName: this.jobName,
  });

  private handleResult = (
    job: JobInstance<Data>,
    result: unknown | JobErrorResult
  ): { success: boolean } => {
    if (result instanceof JobErrorResult) {
      if (result.retryable) {
        logError(
          job.context.logger,
          result.error,
          "Transient task error, may retry if below retry limit",
          {
            data: job.pgBossJob.data,
          }
        );
        throw result.error ?? new Error("Transient task error");
      }

      logError(
        job.context.logger,
        result.error,
        `Job ${this.jobName} failed. Not retrying`,
        {
          data: job.pgBossJob.data,
        }
      );
      return { success: false };
    }

    job.context.logger.info(`Job ${this.jobName} finished successfully`, {
      data: job.pgBossJob.data,
    });
    return { success: true };
  };

  private handleCaughtError = (
    job: JobInstance<Data>,
    error: any
  ): { success: false } => {
    logError(
      job.context.logger,
      error,
      `Job ${this.jobName} threw an error. Will not retry`,
      {
        data: job.pgBossJob.data,
      }
    );
    // No caught error should ever be retried (only properly returned errors).
    // We cannot rethrow because it would cause the task to be retried.
    return { success: false };
  };

  getPgBossOptions = (data: Data): PgBoss.PublishOptions => {
    const options: PgBoss.PublishOptions = {};

    // Has to be constructed this way because pgboss does not support values of undefined
    if (!_.isNil(this.baseRetryDelaySeconds)) {
      options.retryDelay = this.baseRetryDelaySeconds;
    }
    if (!_.isNil(this.retryLimit)) {
      options.retryLimit = this.retryLimit;
    }
    if (!_.isNil(this.retryBackoff)) {
      options.retryBackoff = this.retryBackoff;
    }
    if (!_.isNil(this.expiresInMinutes)) {
      options.expireInMinutes = this.expiresInMinutes;
    }
    const singletonKey = this.singletonKey(data);
    if (!_.isNil(singletonKey)) {
      options.singletonKey = singletonKey;
    }
    if (!_.isNil(this.singletonHours)) {
      options.singletonHours = this.singletonHours;
    }
    return options;
  };
}
