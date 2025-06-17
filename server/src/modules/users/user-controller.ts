import { Context } from '../../config/context';
import { Controller } from '../../utils/controller';
import { UsersPersister } from '../persisters/user-persisters';
import { DatabaseUsersId, DatabaseUsersInitializer } from '../../types/database/DatabaseUsers';
import { throwError } from '../../utils/error-handler';

interface CreateUserData {
  name: string;
  phone?: string;
  email?: string;
  authId?: string;
}

interface UpdateUserData {
  userId: DatabaseUsersId;
  name?: string;
  phone?: string;
  email?: string;
  authId?: string;
}

interface GetUserData {
  userId?: DatabaseUsersId;
  phone?: string;
  email?: string;
  authId?: string;
}

interface SearchUsersData {
  namePattern?: string;
  limit?: number;
}

/**
 * Create a new user or upsert by phone if provided
 */
const createUser = async (context: Context, data: CreateUserData): Promise<any> => {
  // Validate required fields
  if (!data.name || data.name.trim().length === 0) {
    throwError('Name is required');
  }

  // Prepare user data for database
  const userData: DatabaseUsersInitializer = {
    name: data.name.trim(),
    phone: data.phone || null,
    email: data.email || null,
    authId: data.authId || null,
  };

  let user;
  
  // If phone is provided, use upsert (handles conflicts on phone field)
  if (data.phone) {
    user = await UsersPersister.upsertUser(context, userData);
    context.logger.info('User upserted successfully', {
      userId: user.id,
      phone: user.phone,
      name: user.name,
    });
  } else {
    // Create new user without phone
    user = await UsersPersister.createUser(context, userData);
    context.logger.info('User created successfully', {
      userId: user.id,
      name: user.name,
    });
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      authId: user.authId,
    },
  };
};

/**
 * Upsert user (create or update based on phone)
 */
const upsertUser = async (context: Context, data: CreateUserData): Promise<any> => {
  // Validate required fields
  if (!data.name || data.name.trim().length === 0) {
    throwError('Name is required');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    throwError('Phone is required for upsert operation');
  }

  // At this point we know data.phone is defined and not empty
  const phoneValue = data.phone!.trim();

  // Prepare user data for database
  const userData: DatabaseUsersInitializer = {
    name: data.name.trim(),
    phone: phoneValue,
    email: data.email || null,
    authId: data.authId || null,
  };

  const user = await UsersPersister.upsertUser(context, userData);

  context.logger.info('User upserted successfully', {
    userId: user.id,
    phone: user.phone,
    name: user.name,
  });

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      authId: user.authId,
    },
  };
};

/**
 * Update an existing user
 */
const updateUser = async (context: Context, data: UpdateUserData): Promise<any> => {
  if (!data.userId) {
    throwError('User ID is required');
  }

  // Prepare update data (only include non-undefined fields)
  const updates: Partial<Pick<DatabaseUsersInitializer, 'name' | 'phone' | 'email' | 'authId'>> = {};
  
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      throwError('Name cannot be empty');
    }
    updates.name = data.name.trim();
  }
  
  if (data.phone !== undefined) {
    updates.phone = data.phone || null;
  }
  
  if (data.email !== undefined) {
    updates.email = data.email || null;
  }
  
  if (data.authId !== undefined) {
    updates.authId = data.authId || null;
  }

  if (Object.keys(updates).length === 0) {
    throwError('No fields to update');
  }

  const user = await UsersPersister.updateUser(context, data.userId, updates);

  context.logger.info('User updated successfully', {
    userId: user.id,
    updatedFields: Object.keys(updates),
  });

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      authId: user.authId,
    },
  };
};

/**
 * Get user by various identifiers
 */
const getUser = async (context: Context, data: GetUserData): Promise<any> => {
  if (!data.userId && !data.phone && !data.email && !data.authId) {
    throwError('At least one identifier (userId, phone, email, or authId) is required');
  }

  let user;

  if (data.userId) {
    user = await UsersPersister.getUserById(context, data.userId);
  } else if (data.phone) {
    user = await UsersPersister.getUserByPhone(context, data.phone);
  } else {
    // For email or authId, we would need to add these methods to the persister
    // For now, fall back to ID lookup
    throwError('Search by email or authId not yet implemented');
  }

  if (!user) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      authId: user.authId,
    },
  };
};

/**
 * Search users by name pattern
 */
const searchUsers = async (context: Context, data: SearchUsersData): Promise<any> => {
  if (!data.namePattern || data.namePattern.trim().length === 0) {
    throwError('Name pattern is required for search');
  }

  // At this point we know data.namePattern is defined and not empty
  const namePattern = data.namePattern!.trim();

  if (namePattern.length < 2) {
    throwError('Name pattern must be at least 2 characters long');
  }

  const users = await UsersPersister.getUsersByNamePattern(context, namePattern);

  // Apply limit if specified
  const limit = data.limit && data.limit > 0 ? data.limit : undefined;
  const limitedUsers = limit ? users.slice(0, limit) : users;

  return {
    success: true,
    users: limitedUsers.map(user => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      authId: user.authId,
    })),
    totalFound: users.length,
    returned: limitedUsers.length,
  };
};

/**
 * Delete a user
 */
const deleteUser = async (context: Context, data: { userId: DatabaseUsersId }): Promise<any> => {
  if (!data.userId) {
    throwError('User ID is required');
  }

  const deleted = await UsersPersister.deleteUser(context, data.userId);

  if (!deleted) {
    return {
      success: false,
      message: 'User not found or already deleted',
    };
  }

  context.logger.info('User deleted successfully', {
    userId: data.userId,
  });

  return {
    success: true,
    message: 'User deleted successfully',
  };
};

export const UserController = Controller.register({
  name: 'user',
  controllers: {
    createUser: {
      fn: createUser,
      config: {},
    },
    upsertUser: {
      fn: upsertUser,
      config: {},
    },
    updateUser: {
      fn: updateUser,
      config: {},
    },
    getUser: {
      fn: getUser,
      config: {},
    },
    searchUsers: {
      fn: searchUsers,
      config: {},
    },
    deleteUser: {
      fn: deleteUser,
      config: {},
    },
  },
});