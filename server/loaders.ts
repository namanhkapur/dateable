import express from 'express';
import { Knex } from 'knex';
import { setupJobServiceAndAddJobs } from './src/scheduler/job-service-setup';
import { rootLogger } from './src/config/rootLogger';
import { setupDatabase } from './src/database/database';
import { Context } from './src/config/context';
import { expressConfig } from './src/web/express';

export const loaders = async (app: express.Application): Promise<Knex> => {
  // Setup services

  const { knex } = await setupDatabase();

  await setupJobServiceAndAddJobs(rootLogger);

  await expressConfig(Context.create(), app);
  rootLogger.info('Express loaded');

  return knex;
};
