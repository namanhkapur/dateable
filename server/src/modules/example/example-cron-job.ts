import { Context } from '../../config/context';
import { CronJob } from '../../scheduler/cron-job';
import { ExampleController } from './example-controller';

export class TestingCronJob extends CronJob {
  override cron: string = '* * * * *'; // run every minute

  protected override newJobCheckIntervalSeconds: number = 60;

  protected override async executeJob(context: Context): Promise<void> {
    await ExampleController.printLog(context, 'testing cron!');
  }
}
