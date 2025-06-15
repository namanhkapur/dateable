import _ from 'lodash';
import createHttpError from 'http-errors';
import { Context } from '../config/context';
import { isErrorResult, ErrorResult, isErrorResultWithReturn } from './results';
import { ServerErrorCode } from './errors';
import { Expand } from './objects';
import { logError } from './error-handler';

export enum ExecuteControlMetric {
  Latency = 'server.execute_control.latency',
  Complete = 'server.execute_control.complete',
  Start = 'server.execute_control.start',
  InFlight = 'server.execute_control.in_flight',
  DbQueryCount = 'server.execute_control.db_query_count',
}

export enum ControlType {
  Task = 'task',
  User = 'user',
  Webhook = 'webhook',
  Unspecified = 'unspecified',
}

type ControlHandlerConfig<_TData> = {
  /**
   * Determines whether or not the context passed to the controller function will
   * already have an opened transaction that lasts for the lifespan of the request.
   */
  withTransaction?: boolean;

  /**
   * Specifies the type of the control (a default can be set at the Controller level).
   * Currently only affects logging and alerting, but it may change behavior in the future.
   */
  controlType?: ControlType;

  /**
   * If true, logs control data such as success or failure to redshift for analytics.
   * Should be used sparingly while we rely on Segment to send this data as enabling this
   * for all controls would be very expensive.
   */
  withControlAnalytics?: boolean;
};

export type BaseControlHandler<TData, TRest extends any[]> = (
  ctx: Context,
  data: TData,
  ...restArgs: TRest
) => Promise<any>;

export type CustomizedControlHandler<TData, TRest extends any[]> = {
  fn: BaseControlHandler<TData, TRest>;
  config: ControlHandlerConfig<TData>;
};

export type ControlHandlerDefinition<TData, TRest extends any[]> =
  | BaseControlHandler<TData, TRest>
  | CustomizedControlHandler<TData, TRest>;

type ControllerHandlersDefinition = Record<
  string,
  ControlHandlerDefinition<any, any>
>;

export interface ControllerParams<T extends ControllerHandlersDefinition> {
  name: string;
  controllers: T;
  defaultConfig?: ControlHandlerConfig<any>;
}

type Controller<T extends ControllerHandlersDefinition> = {
  [K in keyof T]: T[K] extends CustomizedControlHandler<any, any>
    ? T[K]['fn']
    : T[K];
};

export const reportControllerError = (
  context: Context,
  {
    code,
    message,
    error,
    controlName,
  }: {
    code: ServerErrorCode;
    message: string | undefined;
    error: Error | ErrorResult;
    controlName: string;
  },
) => {
  logError(
    context.logger,
    error,
    `${controlName} control failed with error code ${code}. error: ${message}`,
  );
};

export const executeControl = async <TData, TRest extends any[]>(
  controllerParams: ControllerParams<any>,
  controlName: string,
  controlHandler: BaseControlHandler<TData, TRest>,
  config: ControlHandlerConfig<TData>,
  context: Context,
  data: TData,
  ...restArgs: TRest
) => {
  const withTransaction = config.withTransaction ?? true;
  context.setControlData({
    controlName: controlName.toLowerCase(),
    controllerName: controllerParams.name.toLowerCase(),
    controlType: config.controlType ?? ControlType.Unspecified,
  });
  try {
    context.logger.info(`Control ${controlName} started.`);
    const runControlHandler = (context: Context) =>
      controlHandler(context, data, ...restArgs);
    let result;
    if (withTransaction) {
      result = await context.databaseService.runInTransaction(
        (context: Context) => runControlHandler(context),
      );
    } else {
      result = await runControlHandler(context);
    }
    if (isErrorResult(result)) {
      reportControllerError(context, {
        code: result.code,
        message: result.internalMessage,
        controlName,
        error: result,
      });
      if (isErrorResultWithReturn(result)) {
        return result.returnData;
      }
      return result;
    }
    context.logger.info(`Control ${controlName} successfully completed.`);
    return result;
  } catch (error: any) {
    // If the thrown error is an error result, emit a completion with the error's code
    // and handle before throwing.
    if (isErrorResult(error)) {
      // Log and emit metric for error.
      reportControllerError(context, {
        code: error.code,
        message: error.internalMessage,
        controlName,
        error,
      });
      if (isErrorResultWithReturn(error)) {
        return error.returnData;
      }
    }
    // If the thrown error is another kind of error, log and emit an unexpected_thrown_error completion and rethrow
    else if (createHttpError.isHttpError(error)) {
      reportControllerError(context, {
        code: ServerErrorCode.ExpectedHttpError,
        message: error?.message,
        controlName,
        error,
      });
    } else {
      reportControllerError(context, {
        code: ServerErrorCode.UnexpectedThrownError,
        message: error?.message,
        controlName,
        error,
      });
    }
    throw error;
  }
};

const wrapControlHandler =
  (
    controllerParams: ControllerParams<any>,
    controlName: string,
    controlHandler: BaseControlHandler<any, any>,
    config: ControlHandlerConfig<any>,
  ) =>
  async (ctx: Context, data: any, ...rest: any[]) =>
    executeControl(
      controllerParams,
      controlName,
      controlHandler,
      config,
      ctx,
      data,
      ...rest,
    );

export namespace Controller {
  export const register = <T extends ControllerHandlersDefinition>(
    controllerParams: ControllerParams<T>,
  ): Expand<Controller<T>> =>
    _.fromPairs(
      Object.keys(controllerParams.controllers).map((controlName) => {
        const controlValue = controllerParams.controllers[controlName];
        if (typeof controlValue !== 'function') {
          if (controlValue.fn.name && controlValue.fn.name !== controlName) {
            throw Error(
              `Control handler name ${controlName} doesn't match function name ${controlValue.fn.name} on controller ${controllerParams.name}`,
            );
          }
        }
        const { fn, config } =
          typeof controlValue === 'function'
            ? { fn: controlValue, config: {} }
            : controlValue;
        const controlConfig = { ...controllerParams.defaultConfig, ...config };
        const wrappedControlFn = wrapControlHandler(
          controllerParams,
          controlName,
          fn,
          controlConfig,
        );
        return [controlName, wrappedControlFn];
      }),
    ) as Expand<Controller<T>>;
}
