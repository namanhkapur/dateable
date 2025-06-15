import PgBoss from 'pg-boss';
import _ from 'lodash';
import { Duration } from '@js-joda/core';
import { pgConfig } from '../database/database';
// CronJob cannot be imported as a type or it will cause a circular dependency
import type { CronJob } from './cron-job';
import { OneTimeJobInstance } from './one-time-job';
import { BaseJob, JobSubscription } from './base-job';
import { DEFAULT_TIMEZONE } from '../utils/time';
import { Logger, rootLogger } from '../config/rootLogger';
import { logError } from '../utils/error-handler';
import { env } from '../config/env';

/**
 * Used instead of `instanceof CronJob` to avoid having to import CronJob as a value.
 */
export const isCronJob = (value: any): value is CronJob => !!value?.cron;

export class JobService {
  private constructor(private readonly pgBoss: PgBoss) {}

  private subscriptions: JobSubscription[] = [];

  subscribeJob = async (job: BaseJob<any>) => {
    if (env.RUN_JOBS) {
      this.subscriptions.push(await job.subscribe(this.pgBoss));
      if (isCronJob(job)) {
        await this.scheduleJob(job);
      }
    }
  };

  scheduleJob = async (job: CronJob) => {
    await this.pgBoss.schedule(job.queueName, job.cron, undefined, {
      tz: DEFAULT_TIMEZONE.toString(),
      ...job.getPgBossOptions(),
    });
  };

  removeInactiveSchedules = async (
    logger: Logger,
    activeSchedules: CronJob[],
  ) => {
    const allScheduleNames = (await this.pgBoss.getSchedules()).map(
      (schedule) => schedule.name,
    );
    const activeScheduleNames = new Set(
      activeSchedules.map((job) => job.queueName),
    );
    const schedulesToRemove = allScheduleNames.filter(
      (name) => !activeScheduleNames.has(name),
    );
    logger.info('schedulesToRemove', { schedulesToRemove });
    await Promise.all(
      schedulesToRemove.map((toRemove) => this.pgBoss.unschedule(toRemove)),
    );
  };

  publishJob = async (jobInstance: OneTimeJobInstance<object>) => {
    if (env.IS_TEST) {
      return;
    }
    await this.pgBoss.publish(jobInstance.queueName, jobInstance.data, {
      ...jobInstance.options,
    });
  };

  stop = () => {
    rootLogger.info('Stopping pgboss');
    // void this.pgBoss.stop();
    // Calling pgboss.stop() stops processing new jobs but also prevents new jobs from being published
    // which is not what we want. Until this is fixed, we can just unsubscribe from all jobs instead.
    // https://github.com/timgit/pg-boss/issues/283
    this.subscriptions.forEach((subscription) => {
      void this.pgBoss.unsubscribe({ id: subscription.subscriptionId });
    });
  };

  static setup = async (logger: Logger) => {
    if (JobService.instance) {
      throw new Error('JobService already initialized');
    }
    const pgBoss = new PgBoss({
      ...pgConfig,
      application_name: `dateable-pgboss-api`,
      schema: 'pgboss',
      max: 10,
      newJobCheckIntervalSeconds: 60,
      monitorStateIntervalSeconds: 600,
      archiveCompletedAfterSeconds: Duration.ofHours(2).seconds(),
    });
    logger.info('Created pgboss');

    if (!env.IS_TEST) {
      await pgBoss.start();
      logger.info('Started pgboss');
    }

    const service = new JobService(pgBoss);
    logger.info('Job service is running');
    JobService.instance = service;
    // Callbacks must be initialized after JobService.instance is set
    pgBoss.on('error', (error) => {
      logError(logger, error);
    });
    return service;
  };

  private static instance: JobService | null = null;

  static getInstance = (): JobService => {
    if (!JobService.instance) {
      throw new Error('JobService not initialized');
    }
    return JobService.instance;
  };
}
