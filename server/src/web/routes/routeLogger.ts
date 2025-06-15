import { Request, Response, Handler, ErrorRequestHandler } from 'express';
import expressWinston, {
  ErrorLoggerOptionsWithWinstonInstance,
  LoggerOptionsWithWinstonInstance,
} from 'express-winston';
import _ from 'lodash';
import winston from 'winston';
import { Context } from '../../config/context';
import { rootLogger } from '../../config/rootLogger';
import { Common } from '../../utils/objects';

export const getRequestHeaderNamesInOrder = (
  req: Request,
  normalize: boolean,
) => {
  // Separating with : makes it easier to copy paste in datadog. It is also the format used by waf
  // Not changing old version to maintain historical data
  const rawHeaderNames = req.rawHeaders
    .filter((_, i) => i % 2 === 0)
    .join(normalize ? ':' : ',');
  if (normalize) {
    return rawHeaderNames.toLowerCase();
  }
  return rawHeaderNames;
};

type CommonLoggerOptions = Common<
  ErrorLoggerOptionsWithWinstonInstance,
  LoggerOptionsWithWinstonInstance
>;
const makeBaseOptions = (context: Context): CommonLoggerOptions => ({
  winstonInstance: context.logger as winston.Logger,
  requestWhitelist: [
    'url',
    'headers',
    'method',
    'httpVersion',
    'protocol',
    'ip',
    'originalUrl',
    'query',
    'body',
  ],
  headerBlacklist: ['cookie'],
  dynamicMeta: (req) => ({
    // req.ip should be non-nil but that does not always seem to be the
    // case. Some health checks in the workers appear to be missing the ip
    subnet16: req.ip?.match(/^(\d{1,3}\.\d{1,3})/)?.[0],
    subnet24: req.ip?.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})/)?.[0],
    requestHeaderNames: getRequestHeaderNamesInOrder(req, false),
    normalizedRequestHeaderNames: getRequestHeaderNamesInOrder(req, true),
  }),
});

const makeRouteLogger = (context: Context) =>
  expressWinston.logger({
    ...makeBaseOptions(context),
    statusLevels: true,
    responseWhitelist: ['statusCode', 'body'],
    responseFilter: (res, propName) => res[propName],
    requestFilter: (req, propName) => {
      if (propName === 'body') {
        // Remove loadposting payload due to size
        if (
          req.url === '/loads/postings/lbnetwork/postLoads' ||
          req.url === '/loads/postings/lbnetwork/removeLoads'
        ) {
          // req.body needs to be an object for readable logger output.
          req.body = {
            data: '[TRUNCATED]',
          };
        }
      }
      return req[propName];
    },
    // TODO 2023-05-31 temporarily allowed. Re-add after container dying investigation
    // ignoredRoutes: ['/'],
  });

const makeErrorLogger = (context: Context) =>
  expressWinston.errorLogger(makeBaseOptions(context));

const getContextForLogger = (baseContext: Context, req: Request): Context => {
  const requestContext = (req as any)?.context as Context | undefined;
  if (!_.isNil(requestContext)) {
    return requestContext;
  }
  baseContext.logger.warn('No context found on request');
  return baseContext;
};

export const makePerRequestRouteLogger =
  (baseContext: Context): Handler =>
  (req: Request, res: Response, next) => {
    makeRouteLogger(getContextForLogger(baseContext, req))(req, res, next);
  };

export const makePerRequestErrorLogger =
  (baseContext: Context): ErrorRequestHandler =>
  (err: any, req: Request, res: Response, next) => {
    let context = (req as any)?.context as Context | undefined;
    if (_.isNil(context)) {
      context = baseContext;
    }
    makeErrorLogger(getContextForLogger(baseContext, req))(err, req, res, next);
  };

/**
 * This middleware is intentionally as barebones as possible so that we can log
 * incoming requests right away and without risking other libraries throwing
 * errors before we have a chance to log that the request occurred.
 */
export const incomingRequestLogger: Handler = (req, res, next) => {
  const headersCopy = { ...req.headers };
  delete headersCopy.cookie;
  rootLogger.info('Received incoming HTTP request', {
    url: req.url,
    method: req.method,
    headers: headersCopy,
    protocol: req.protocol,
  });
  next();
};
