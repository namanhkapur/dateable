import winston from 'winston';
import { env } from './env';

export type Logger = Omit<winston.Logger, 'log'> & {
  log(
    level: 'info' | 'warn' | 'error',
    message: string,
    ...meta: any[]
  ): Logger;
};

const baseFormat = () => [
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
];

const consoleTransport = new winston.transports.Console({
  silent: env.IS_TEST,
  handleExceptions: true,
  format: winston.format.combine(
    ...baseFormat(),
    winston.format.prettyPrint({ colorize: true, depth: 4 }),
  ),
});

const makeLogger = (): Logger => {
  const logger = winston.createLogger({
    transports: [consoleTransport],
    exitOnError: false,
    handleExceptions: true,
    // defaultMeta does not seem to work properly. Hence the use of addExtraFields
  });

  // For some reason the "root" logger doesn't seem to handle logging exceptions properly
  // But giving it empty metadata makes it work.
  return logger.child({});
};

export const wrapLogger = (logger: Logger, metadata: object): Logger =>
  logger.child(metadata);

export const rootLogger: Logger = makeLogger();
