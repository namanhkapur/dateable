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
): Promise<DatabaseUsers> => {
  return await context.databaseService
    .query(UsersModel)
    .insert(user)
    .onConflict('phone')
    .merge()
    .returning('*')
    .first();
};

/**
 * Get a user by their phone number.
 */
const getUserByPhone = async (
  context: Context,
  phone: string,
): Promise<DatabaseUsers | undefined> => {
  return await context.databaseService
    .query(UsersModel)
    .where({ phone })
    .first();
};

/**
 * Get a user by their ID.
 */
const getUserById = async (
  context: Context,
  id: DatabaseUsersId,
): Promise<DatabaseUsers | undefined> => {
  return await context.databaseService
    .query(UsersModel)
    .where({ id })
    .first();
};

/**
 * Create a new user.
 */
const createUser = async (
  context: Context,
  user: DatabaseUsersInitializer,
): Promise<DatabaseUsers> => {
  return await context.databaseService
    .query(UsersModel)
    .insert(user)
    .returning('*')
    .first();
};

/**
 * Update a user by ID.
 */
const updateUser = async (
  context: Context,
  id: DatabaseUsersId,
  updates: Partial<Pick<DatabaseUsers, 'name' | 'phone'>>,
): Promise<DatabaseUsers> => {
  return await context.databaseService
    .query(UsersModel)
    .where({ id })
    .update(updates)
    .throwIfNotFound()
    .returning('*')
    .first();
};

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
): Promise<DatabaseUsers[]> => {
  return context.databaseService
    .query(UsersModel)
    .where('name', 'ilike', `%${namePattern}%`)
    .orderBy('name');
};

export const UsersPersister = {
  upsertUser,
  getUserByPhone,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByNamePattern,
};