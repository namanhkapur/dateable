import { convert, ZonedDateTime } from "@js-joda/core";
import PgBoss from "pg-boss";
import { Context } from "../config/context";
import { BaseJob } from "./base-job";
import { JobService } from "./job-service";

export abstract class OneTimeJob<Data extends object> extends BaseJob<Data> {
  public async enqueue(
    context: Context,
    data: Data,
    startAfter?: ZonedDateTime
  ) {
    const options: PgBoss.PublishOptions = {
      ...this.getPgBossOptions(data),
      ...(startAfter ? { startAfter: convert(startAfter).toDate() } : {}),
    };
    const jobInstance: OneTimeJobInstance<Data> = {
      queueName: this.queueName,
      data,
      options,
    };
    if (context.databaseService.isInTransaction()) {
      await context.databaseService.enqueueJob(jobInstance);
    } else {
      await JobService.getInstance().publishJob(jobInstance);
    }
  }
}

export interface OneTimeJobInstance<Data extends object> {
  queueName: string;
  data: Data;
  options: PgBoss.PublishOptions;
}
