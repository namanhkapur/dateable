import { Context } from '../../config/context';
import { Controller } from '../../utils/controller';
import { exampleOneTimeJob } from './example-one-time-job';

const printLog = async (context: Context, data: any) => {
  context.logger.info(`printing data: ${JSON.stringify(data)}`);
};

const enqueuePrintLogJob = async (context: Context, data: any) => {
  await exampleOneTimeJob.enqueue(context, { data });
};

export const ExampleController = Controller.register({
  name: 'test',
  controllers: {
    printLog: {
      fn: printLog,
      config: {},
    },
    enqueuePrintLogJob: {
      fn: enqueuePrintLogJob,
      config: {},
    },
  },
});
