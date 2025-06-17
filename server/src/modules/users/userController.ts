import { Request, Response } from 'express';
import { UserService } from './userService';
import { Context } from '../../config/context';
import { RequestWithContext } from '../../web/routes/router-helpers';

export class UserController {
  constructor(private userService: UserService) {}

  createUser = async (req: RequestWithContext, res: Response) => {
    try {
      const { name, phone } = req.body;
      const authId = req.user?.id;
      const email = req.user?.email;

      if (!name || !phone || !authId || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await this.userService.createUser({ name, phone, authId, email });
      res.status(201).json(user);
    } catch (error: any) {
      if (error.message === 'Invalid phone number format') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Invalid email format') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'User with this phone number already exists') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({ error: error.message });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };

  getCurrentUser = async (req: RequestWithContext, res: Response) => {
    try {
      const authId = req.user?.id;
      if (!authId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await this.userService.getCurrentUser(authId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Failed to get current user' });
    }
  };
} 