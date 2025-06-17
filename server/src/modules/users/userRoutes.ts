import { Router } from 'express';
import { UserController } from './userController';
import { UserService } from './userService';
import { authMiddleware } from '../../middleware/auth';
import { Context } from '../../config/context';

const router = Router();

// Create a new user
router.post('/', authMiddleware, (req, res, next) => {
  const context = (req as any).context as Context;
  const userService = new UserService(context);
  const userController = new UserController(userService);
  userController.createUser(req, res).catch(next);
});

// Get current user
router.get('/me', authMiddleware, (req, res, next) => {
  const context = (req as any).context as Context;
  const userService = new UserService(context);
  const userController = new UserController(userService);
  userController.getCurrentUser(req, res).catch(next);
});

export default router; 