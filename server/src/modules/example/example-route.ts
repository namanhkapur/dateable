import express from 'express';
import { addPublicRoute } from '../../web/routes/router-helpers';
import { ExampleController } from './example-controller';

export const router = express.Router();

// because the controller's name is "example" in the config, the endpoint here is hit by
// localhost/example/test
addPublicRoute(router, '/test', ExampleController.printLog);

// localhost/example/testJob
addPublicRoute(router, '/testJob', ExampleController.enqueuePrintLogJob);
