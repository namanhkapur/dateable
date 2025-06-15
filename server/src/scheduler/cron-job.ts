import { BaseJob } from "./base-job";

export abstract class CronJob extends BaseJob<void> {
  public abstract readonly cron: string;
}
