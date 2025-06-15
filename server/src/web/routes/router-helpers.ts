import {
  CookieOptions,
  Handler,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import _ from 'lodash';
import multer from 'multer';
import { ErrorResult, isErrorResult } from '../../../src/utils/results';
import { Context } from '../../config/context';
import { rootLogger } from '../../config/rootLogger';
import { AjvT } from '../../middleware/ajv';
import { logError, throwError } from '../../utils/error-handler';
import { Nilable } from '../../utils/objects';
import validator from '../validator';

export interface Cookie {
  name: string;
  value: string;
  options: CookieOptions;
}

const setCookieOnResponse = (res: Response, cookie: Cookie) => {
  res.cookie(cookie.name, cookie.value, cookie.options);
};

const makeContext = async (req: Request): Promise<Context> => {
  const context = Context.create();
  context.addMetadata({ url: req.originalUrl });
  return context;
};

export interface RequestWithContext extends Request {
  context?: Context;
}

export class CookieResult<D> {
  constructor(readonly data: D, readonly cookie: Cookie) {}
}

type RouteHandler<TParams, TRequest, TResult> = (
  context: Context,
  data: TParams,
  req: TRequest,
  res: Response,
) => Promise<TResult | ErrorResult>;

export const contextMiddleware: Handler = (req: Request, _, next) => {
  makeContext(req)
    .then((context) => {
      (req as RequestWithContext).context = context;
      next();
    })
    .catch(next);
};

const checkPath = (path: string) => {
  if (!path.startsWith('/')) {
    throwError(`Path must start with '/': ${path}`);
  }
  if (path.endsWith('/')) {
    throwError(`Path must not end with '/': ${path}`);
  }
};

const setCacheHeaders = (req: Request, res: Response) => {
  // POST requests should only be cached if specifically instructed to by setting cache-control
  // But explicitly specifying no caching should be safer
  if (req.method.toUpperCase() === 'POST') {
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const now = new Date().toUTCString();
    res.setHeader('Expires', now);
    res.setHeader('Date', now);
  }
};

export const toFrontendErrorResult = async (
  result: ErrorResult,
  _req: Request,
) => {
  const baseData = {
    code: result.code,
    internalMessage: result.internalMessage,
  };
  return {
    ...baseData,
    internalMessage: result.internalMessage,
    stack: result.stack,
  };
};

const fileUploadConfig = multer({ storage: multer.memoryStorage() }).any();
const noOpMiddleware = (_req: unknown, _res: unknown, next: NextFunction) =>
  next();

const handleErrorResult = async (
  result: ErrorResult,
  req: Request,
  res: Response,
) => {
  const convertedErrorResult = await toFrontendErrorResult(result, req);
  res
    .status(400)
    .set('Content-Type', 'application/json')
    .send(convertedErrorResult);
};

const addRoute = <Params, Result>(
  router: Router,
  path: string,
  requestSchema: Nilable<AjvT<Params>>,
  allowFileUpload: boolean,
  returnPDF: boolean,
  handler: RouteHandler<Params, Request, Result>,
) => {
  checkPath(path);
  router.post(
    path,
    allowFileUpload ? fileUploadConfig : noOpMiddleware,
    (req, res, next) => {
      const context = (req as RequestWithContext).context!;
      (async () => {
        // await logUserId(context, req);
        const body = validator<Params>(context, req.body, requestSchema);
        const result = await handler(context, body, req, res);
        if (result instanceof CookieResult) {
          setCookieOnResponse(res, result.cookie);
          return result.data;
        }
        return result;
      })()
        .finally(() => {
          setCacheHeaders(req, res);
        })
        .then(async (result) => {
          if (isErrorResult(result)) {
            await handleErrorResult(result, req, res);
          } else {
            res
              .status(200)
              .set(
                'Content-Type',
                returnPDF ? 'application/pdf' : 'application/json',
              )
              .send(returnPDF ? result : JSON.stringify(result));
          }
        })
        .catch(async (err: unknown) => {
          if (isErrorResult(err)) {
            await handleErrorResult(err, req, res);
          } else {
            next(err);
          }
        })
        // If any errors occur during the above error handling
        // this guarantees that the request will continue to be processed.
        .catch((err: unknown) => {
          next(err);
          // We run this after calling next to ensure the request does not hang
          // if something goes wrong with logging
          logError(
            rootLogger,
            err,
            'Error occurred during error handling in error-handling',
          );
        });
    },
  );
};

export const addPublicRoute = <Params, Result>(
  router: Router,
  path: string,
  handler: (context: Context, data: Params, req: Request) => Promise<Result>,
  requestSchema?: AjvT<Params>,
) => {
  addRoute<Params, Result>(router, path, requestSchema, false, false, handler);
};
