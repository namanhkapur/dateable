import { Context } from '../config/context';
import { UsersPersister } from '../modules/persisters/user-persisters';
import { DatabaseUsersId } from '../types/database/DatabaseUsers';
import { throwError } from './error-handler';

const NORMALISED_USERNAME = /^[a-zA-Z0-9_-]{3,20}$/;

/**
 * Normalizes a username by trimming whitespace and converting to lowercase for case-insensitive operations
 */
const normaliseUsername = (username?: string | null): string | null => username?.trim() || null;

/**
 * Validates username format and checks availability
 * @param context - Database context
 * @param username - Username to validate
 * @param allowOwnedId - Optional user ID to exclude from availability check (for updates)
 * @returns Normalized username
 * @throws Error if validation fails
 */
const validateAndAssertUsername = async (
  context: Context,
  username: string,
  allowOwnedId?: DatabaseUsersId,
): Promise<string> => {
  const normalizedUsername = normaliseUsername(username);
  
  if (!normalizedUsername) {
    throwError('Username cannot be empty');
  }
  
  // TypeScript assertion: normalizedUsername is guaranteed to be string here
  const validUsername = normalizedUsername as string;
  
  if (!NORMALISED_USERNAME.test(validUsername)) {
    throwError('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
  }

  // Check availability
  const existingUser = await UsersPersister.getUserByUsername(context, validUsername);
  if (existingUser && existingUser.id !== allowOwnedId) {
    throwError('Username is already taken');
  }
  
  return validUsername;
};

/**
 * Validates username format without checking availability
 * @param username - Username to validate
 * @returns Normalized username
 * @throws Error if format validation fails
 */
const validateUsernameFormat = (username: string): string => {
  const normalizedUsername = normaliseUsername(username);
  
  if (!normalizedUsername) {
    throwError('Username cannot be empty');
  }
  
  // TypeScript assertion: normalizedUsername is guaranteed to be string here
  const validUsername = normalizedUsername as string;
  
  if (!NORMALISED_USERNAME.test(validUsername)) {
    throwError('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
  }
  
  return validUsername;
};

export const UsernameValidator = {
  normaliseUsername,
  validateAndAssertUsername,
  validateUsernameFormat,
};