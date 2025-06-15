import { exit } from 'process';
import { rootLogger } from './src/config/rootLogger';
import { startAppAndServer } from './server';

// Added temporarily to understand where our process is being killed from
const originalExit = process.exit;
// @ts-ignore
process.exit = (code?: number): never => {
  const error = new Error('process about to exit');
  rootLogger.error('calling process.exit', {
    stack: error.stack,
    name: error.name,
    message: error.message,
  });
  originalExit(code);
};

// For some reason we need to manually call trace so that subsequent log
// messages are injected with the right data.
void startAppAndServer().catch((error: any) => {
  rootLogger.error(error);
  exit(1);
});
