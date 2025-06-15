import { Context } from '../../config/context';
import { OneTimeJob } from '../../scheduler/one-time-job';
import { ExampleController } from './example-controller';

export type ExampleData = {
  data: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class ExampleOneTimeJob extends OneTimeJob<ExampleData> {
  protected override newJobCheckIntervalSeconds: number = 5;

  protected override async executeJob(
    context: Context,
    data: ExampleData,
  ): Promise<void> {
    await sleep(10000);
    await ExampleController.printLog(context, data);
  }
}
export const exampleOneTimeJob = new ExampleOneTimeJob();
