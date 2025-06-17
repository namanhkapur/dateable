import { Context } from '../../config/context';
import { BaseModel } from '../../database/base-model';
import DatabaseUsers, { DatabaseUsersInitializer, DatabaseUsersId } from '../../types/database/DatabaseUsers';

export interface UsersModel extends DatabaseUsers {}

export class UsersModel extends BaseModel {
  static override tableName = 'public.users';
}

/**
 * Upserts a single user by the unique "phone" field.
 */
const upsertUser = async (
  context: Context,
  user: DatabaseUsersInitializer,
): Promise<DatabaseUsers> => context.databaseService
    .query(UsersModel)
    .insert(user)
    .onConflict('phone')
    .merge()
    .returning('*')
    .first();

/**
 * Get a user by their phone number.
 */
const getUserByPhone = async (
  context: Context,
  phone: string,
): Promise<DatabaseUsers | undefined> => context.databaseService
    .query(UsersModel)
    .where({ phone })
    .first();

/**
 * Get a user by their ID.
 */
const getUserById = async (
  context: Context,
  id: DatabaseUsersId,
): Promise<DatabaseUsers | undefined> => context.databaseService
    .query(UsersModel)
    .where({ id })
    .first();

/**
 * Get a user by their auth ID (Supabase UUID).
 */
const getUserByAuthId = async (
  context: Context,
  authId: string,
): Promise<DatabaseUsers | undefined> => context.databaseService
    .query(UsersModel)
    .where({ authId })
    .first();

/**
 * Create a new user.
 */
const createUser = async (
  context: Context,
  user: DatabaseUsersInitializer,
): Promise<DatabaseUsers> => context.databaseService
    .query(UsersModel)
    .insert(user)
    .returning('*')
    .first();

/**
 * Update a user by ID.
 */
const updateUser = async (
  context: Context,
  id: DatabaseUsersId,
  updates: Partial<Pick<DatabaseUsers, 'name' | 'phone' | 'username' | 'email' | 'authId'>>,
): Promise<DatabaseUsers> => context.databaseService
    .query(UsersModel)
    .where({ id })
    .update(updates)
    .throwIfNotFound()
    .returning('*')
    .first();

/**
 * Delete a user by ID.
 */
const deleteUser = async (
  context: Context,
  id: DatabaseUsersId,
): Promise<boolean> => {
  const deletedCount = await context.databaseService
    .query(UsersModel)
    .where({ id })
    .delete();
  return deletedCount > 0;
};

/**
 * Get users by name pattern (case-insensitive search).
 */
const getUsersByNamePattern = async (
  context: Context,
  namePattern: string,
): Promise<DatabaseUsers[]> => context.databaseService
    .query(UsersModel)
    .where('name', 'ilike', `%${namePattern}%`)
    .orderBy('name');

/**
 * Get a user by their username.
 */
const getUserByUsername = async (
  context: Context,
  username: string,
): Promise<DatabaseUsers | undefined> => context.databaseService
    .query(UsersModel)
    .where({ username })
    .first();

/**
 * Check if a username exists.
 */
const isUsernameAvailable = async (
  context: Context,
  username: string,
): Promise<boolean> => {
  const user = await context.databaseService
    .query(UsersModel)
    .where({ username })
    .first();
  return !user;
};

/**
 * Get a user by their email.
 */
const getUserByEmail = async (
  context: Context,
  email: string,
): Promise<DatabaseUsers | undefined> => context.databaseService
    .query(UsersModel)
    .where({ email })
    .first();

export const UsersPersister = {
  upsertUser,
  getUserByPhone,
  getUserById,
  getUserByAuthId,
  getUserByUsername,
  getUserByEmail,
  isUsernameAvailable,
  createUser,
  updateUser,
  deleteUser,
  getUsersByNamePattern,
};