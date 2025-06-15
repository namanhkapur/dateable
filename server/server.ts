import express from 'express';
import https from 'https'; // Add this line

import { Server } from 'net';
import { createServer } from 'http';
import fs from 'fs';
import { Duration } from '@js-joda/core';
import { loaders } from './loaders';
import { Context } from './src/config/context';
import { rootLogger } from './src/config/rootLogger';
import { JobService } from './src/scheduler/job-service';
import { env } from './src/config/env';

export const startApp = async () => {
  // Catch and report errors if the main server crashes
  process.on('uncaughtException', (error) =>
    rootLogger.error('uncaughtException', { error }),
  );
  process.on('unhandledRejection', (reason, promise) => {
    rootLogger.error('unhandledRejection', { reason, promise });
  });
  const app = express();
  // Load all pre-server dependencies
  const knex = await loaders(app);

  process.on('SIGTERM', () => {
    rootLogger.info('received SIGTERM');
    JobService.getInstance().stop();
    if (env.NODE_ENV === 'development') {
      process.exit();
    }
  });

  process.on('SIGINT', () => {
    rootLogger.info('received SIGINT');
    JobService.getInstance().stop();
    if (env.NODE_ENV === 'development') {
      process.exit();
    }
  });

  return { app, knex };
};

export const startServer = async (
  app: express.Application,
  startTimeEpochMs: number,
): Promise<Server> => {
  const context = Context.create();

  const server = createServer(app);
  // Per https://stackoverflow.com/a/47986080 -- keepAliveTimeout needs to be
  // greater than our ALB's idle timeout.
  server.keepAliveTimeout = Duration.ofMinutes(6).toMillis();
  // See also https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
  server.headersTimeout = Duration.ofMinutes(7).toMillis();
  server
    .listen(env.PORT, () => {
      // Remove functions
      context.logger.info(`Server is running on port ${env.PORT}`, {
        startupTimeMs: Date.now() - startTimeEpochMs,
      });
    })
    .on('error', (err) => {
      context.logger.error(err);
    });

  const shutdown = (signal: string) => {
    context.logger.warn(`${signal} signal received: closing backend server`);
    server.close(() => {
      context.logger.info('Server Closed');
    });
  };

  if (env.NODE_ENV === 'production') {
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  return server;
};

export const startHttpsServer = async (
  app: express.Application,
  startTimeEpochMs: number,
): Promise<Server> => {
  const context = Context.create();

  let httpsOptions = {}

  const server = https.createServer(httpsOptions, app);
  // Per https://stackoverflow.com/a/47986080 -- keepAliveTimeout needs to be
  // greater than our ALB's idle timeout.
  server.keepAliveTimeout = Duration.ofMinutes(6).toMillis();
  // See also https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
  server.headersTimeout = Duration.ofMinutes(7).toMillis();
  server
    .listen(env.HTTPS_PORT, () => {
      // Remove functions
      context.logger.info(`Server is running on port ${env.HTTPS_PORT}`, {
        startupTimeMs: Date.now() - startTimeEpochMs,
      });
    })
    .on('error', (err) => {
      context.logger.error(err);
    });

  const shutdown = (signal: string) => {
    context.logger.warn(`${signal} signal received: closing backend server`);
    server.close(() => {
      context.logger.info('Server Closed');
    });
  };

  if (env.NODE_ENV === 'production') {
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  return server;
};

export const startAppAndServer = async () => {
  const startTime = Date.now();
  const { app } = await startApp();
  await startServer(app, startTime);
  await startHttpsServer(app, startTime);
};
