import _ from "lodash";
import pMapSeries from "p-map-series";
import { Context } from "../config/context";
import { logError } from "./error-handler";
import { ServerErrorCode } from "./errors";

export interface ErrorResultArgs {
  error?: Error | unknown;
  internalMessage?: string;
  retryable?: boolean;
}

export class ErrorResult<
  Code extends ServerErrorCode = ServerErrorCode
> extends Error {
  readonly code: ServerErrorCode;
  readonly internalMessage?: string;
  retryable?: boolean;

  constructor(code: Code, optionalArgs?: ErrorResultArgs) {
    super(optionalArgs?.internalMessage ?? code);
    this.code = code;
    this.internalMessage = optionalArgs?.internalMessage;
    this.retryable = optionalArgs?.retryable;
  }
}

export class CompositeErrorResult extends ErrorResult {
  // We use a record here because arrays cannot be added as facets to logs.
  constructor(
    readonly errorResults: Record<any, ErrorResult>,
    optionalArgs?: ErrorResultArgs
  ) {
    super(ServerErrorCode.CompositeError, optionalArgs);
  }
}

export class ErrorResultWithReturn<T> extends ErrorResult {
  readonly returnData: T;
  constructor(
    code: ServerErrorCode,
    returnValue: T,
    optionalArgs?: ErrorResultArgs
  ) {
    super(code, optionalArgs);
    this.returnData = returnValue;
  }
}

export class CompositeResult<T> {
  readonly result: T;
  readonly error?: Error;
  constructor(result: T, error?: Error) {
    this.result = result;
    this.error = error;
  }
}

export const isErrorResult = (value: any): value is ErrorResult =>
  value instanceof ErrorResult;

export const isErrorResultWithReturn = <T>(
  res: unknown
): res is ErrorResultWithReturn<T> => isErrorResult(res) && "returnData" in res;

/**
 * @deprecated create and throw an ErrorResult directly with `throw new ErrorResult(code, optionalArgs)`
 */
export const errorResult = (
  code: ServerErrorCode,
  error?: Error
): ErrorResult =>
  new ErrorResult(code, {
    error,
    internalMessage: error?.message,
  });

/**
 * @deprecated create and throw an ErrorResult directly with `throw new ErrorResult(code, optionalArgs)`
 */
export const errorResultWithMessage = (args: {
  code: ServerErrorCode; // error code
  internalMessage: string; // Message to be recorded in datadog
  error?: Error;
}): ErrorResult => new ErrorResult(args.code, args);

export const handleUnexpectedThrownError = (
  error: Error | ErrorResult
): ErrorResult => {
  if (isErrorResult(error)) {
    return error;
  }
  return new ErrorResult(ServerErrorCode.UnexpectedThrownError, { error });
};

export async function batchProcessDataAndReturn<K, T>(
  context: Context,
  data: K[],
  func: (k: K) => T | Promise<T>,
  errorCode?: ServerErrorCode,
  errorMessageFunc?: (k: K) => string
): Promise<CompositeResult<T[]>> {
  const results: T[] = [];
  const errors: Error[] = [];
  await pMapSeries(data, async (row) => {
    try {
      const result = await func(row);
      results.push(result);
    } catch (error) {
      errors.push(error as Error);
      logError(
        context.logger,
        error,
        errorMessageFunc
          ? errorMessageFunc(row)
          : "batchProcessDataAndReturn threw error"
      );
    }
  });
  const error = errors.length
    ? new ErrorResult(errorCode ?? ServerErrorCode.CompositeError, {
        internalMessage: `${errors.length} errors were returned.`,
        error: errors,
      })
    : undefined;
  return new CompositeResult(results, error);
}

export async function batchProcessDataOrThrow<K, T>(
  context: Context,
  data: K[],
  func: (k: K) => T | Promise<T>,
  errorCode?: ServerErrorCode,
  errorMessageFunc?: (k: K) => string
): Promise<T[]> {
  const { result, error } = await batchProcessDataAndReturn(
    context,
    data,
    func,
    errorCode,
    errorMessageFunc
  );
  if (error) {
    throw error;
  }
  return result;
}
