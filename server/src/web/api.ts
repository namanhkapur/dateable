import { Router } from 'express';

import expressListRoutes from 'express-list-routes';
import { router as example } from '../modules/example/example-route';
import { router as uploads } from '../modules/uploads/file-upload-routes';
import { router as users } from '../modules/users/user-route';
import { router as index } from './routes';
import { router as catchall } from './routes/catchall';

export const buildApi = () => {
  const app = Router();
  app.use(index);
  app.use('/example', example);
  app.use('/uploads', uploads);
  app.use('/users', users);

  // catchall requests not matched in our API
  app.use(catchall);

  return app;
};

// Cast because express-list-routes doesn't have the correct type
export const listRoutes = () => expressListRoutes(buildApi() as any);
