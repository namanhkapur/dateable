import _ from 'lodash';
import createHttpError from 'http-errors';
import StatusCodes from 'http-status-codes';
import { Logger } from '../config/rootLogger';

export const errorToPlainObject = (error: any) => {
  if (typeof error !== 'object') {
    return error;
  }
  const obj = { ...error };
  if (error.stack) {
    obj.stack = error.stack;
  }
  if (error.cause) {
    obj.cause = errorToPlainObject(error.cause);
  }
  return obj;
};

let _lastSentTime: number | undefined;

/**
 * Standardizes how we log errors so that the error is formated in a useful way
 * in datadog.
 * @param logger
 * @param error
 * @param message - optional message
 * @param extraMetadata - additional metadata to log
 */
export const logError = (
  logger: Logger,
  error: unknown,
  message?: string,
  extraMetadata?: {},
) => {
  logger.error(message ?? 'Error', {
    ...extraMetadata,
    error: errorToPlainObject(error),
  });
};

export const throwError = (message: string): never => {
  throw new Error(message);
};

export const badRequest = (message: string): never => {
  throw createHttpError(StatusCodes.BAD_REQUEST, message);
};
