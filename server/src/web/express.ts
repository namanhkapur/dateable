import express from 'express';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import compression from 'compression';

import { Context } from '../config/context';
import {
  incomingRequestLogger,
  makePerRequestErrorLogger,
  makePerRequestRouteLogger,
} from '../web/routes/routeLogger';
import { buildApi, listRoutes } from './api';
import { contextMiddleware } from './routes/router-helpers';

const storeRawBodyIntoRequest = (req: any, _res: any, buf: Buffer) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString('utf8');
  }
};

export const expressConfig = async (
  context: Context,
  app: express.Application,
) => {
  app.use(incomingRequestLogger);

  app.use(contextMiddleware);

  // This must be before route logging
  app.use(compression());

  // Must come after contextMiddleware since it needs a context
  // Must come as early as possible so that we can more accurately
  // capture the elapsed time. For example, json parsing can be
  // slow.
  app.use(makePerRequestRouteLogger(context));

  const corsConfig: CorsOptions = {
    methods: 'GET,POST',
    origin: true,
  };

  app.use(cors(corsConfig));
  app.options('*', cors(corsConfig));

  app.use(cookieParser());

  // Stores the raw string of req.body in the request. Used for zendesk webhook authentication.
  app.use(
    express.json({
      verify: storeRawBodyIntoRequest,
      limit: '20mb',
    }),
  );

  app.use(express.urlencoded({ extended: true }));

  // Transforms raw XML to a string for parsing.
  app.use(
    express.text({ limit: '20mb', type: ['text/xml', 'application/xml'] }),
  );

  app.get('/status', (_req, res) => res.status(200).end());
  app.head('/status', (_req, res) => res.status(200).end());

  // Load API routes
  app.use(buildApi());
  context.logger.info(listRoutes());

  // Log all errors
  app.use(makePerRequestErrorLogger(context));
};
