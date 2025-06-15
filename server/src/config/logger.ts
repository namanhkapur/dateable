import { env } from './env';

interface Logger {
  info(message: string, context?: object): void;
  error(message: string, context?: object): void;
}

const logger: Logger = {
  info: (...args) => {
    if (!env.IS_TEST) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  error: (...args) => {
    if (!env.IS_TEST) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
};

export default logger;
