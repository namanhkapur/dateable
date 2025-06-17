import express from 'express';
import { addPublicRoute } from '../../web/routes/router-helpers';
import { PromptsController } from './prompts-controller';

export const router = express.Router();

addPublicRoute(router, '/all', PromptsController.getAllPrompts);