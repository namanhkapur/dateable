import express from 'express';
import { addPublicRoute } from '../../web/routes/router-helpers';
import { UserController } from './user-controller';
import { DatabaseUsersId } from '../../types/database/DatabaseUsers';

export const router = express.Router();

// POST /users/create - Create a new user (with optional upsert by phone)
addPublicRoute(router, '/create',  UserController.createUser);

// POST /users/upsert - Upsert user by phone (phone required)
addPublicRoute(router, '/upsert',  UserController.upsertUser);

// POST /users/update - Update an existing user
addPublicRoute(router, '/update',  UserController.updateUser);

// POST /users/get - Get user by various identifiers
addPublicRoute(router, '/get',  UserController.getUser);

// POST /users/search - Search users by name pattern
addPublicRoute(router, '/search',  UserController.searchUsers);

// POST /users/delete - Delete user by ID
addPublicRoute(router, '/delete',  UserController.deleteUser);