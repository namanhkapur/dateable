import { env } from '../config/env';
import { Logger } from '../config/rootLogger';
// import { TestingCronJob } from "../modules/example/example-cron-job";
import { BaseJob } from './base-job';
import { CronJob } from './cron-job';
import { JobService } from './job-service';
import { OneTimeJob } from './one-time-job';

/**
 * Crons jobs only make sense to schedule once when the server is starting up,
 * so all valid jobs should be returned from this function.
 * @returns All cron jobs to schedule
 */
const getAllCronJobs = (): CronJob[] => [
  // new ScrapeNewestRedditPostsCronJob(),
];

const getAllOneTimeJobs = (): OneTimeJob<any>[] => [
  // exampleOneTimeJob,
];

const assertNoDuplicateJobQueues = (jobs: BaseJob<any>[]) => {
  const names = jobs.map((job) => job.queueName).sort();
  for (let i = 0; i < names.length; i++) {
    if (names[i] === names[i + 1]) {
      throw new Error(
        `There is more than one job with the queue name ${names[i]}`,
      );
    }
  }
};

const subscribeAllJobs = async (service: JobService, logger: Logger) => {
  logger.info('Subscribing to all jobs');
  const cronJobs = getAllCronJobs();
  const oneTimeJobs = getAllOneTimeJobs();
  const allJobs = [...cronJobs, ...oneTimeJobs];
  assertNoDuplicateJobQueues(allJobs);
  logger.info('got all jobs');
  await Promise.all(allJobs.map((job) => service.subscribeJob(job)));
  logger.info('finished subscribing to all jobs');
  await service.removeInactiveSchedules(logger, cronJobs);
  logger.info('removed inactive schedules');
};

export const setupJobServiceAndAddJobs = async (logger: Logger) => {
  logger.info('Setting up job service');
  const service = await JobService.setup(logger);
  if (!env.IS_TEST) {
    await subscribeAllJobs(service, logger);
  }
  logger.info('Finished setting up job service');
};
