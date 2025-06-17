import { Context } from '../../config/context';
import { UsersPersister } from '../persisters/user-persisters';
import { DatabaseUsers } from '../../types/database/DatabaseUsers';

interface CreateUserParams {
  name: string;
  phone: string;
  authId: string;
  email: string;
}

export class UserService {
  constructor(private context: Context) {}

  async createUser(params: CreateUserParams): Promise<DatabaseUsers> {
    const { name, phone, authId, email } = params;

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number format');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists by phone
    const existingUserByPhone = await UsersPersister.getUserByPhone(this.context, phone);
    if (existingUserByPhone) {
      throw new Error('User with this phone number already exists');
    }

    // Check if user already exists by email
    const existingUserByEmail = await this.context.databaseService
      .query(UsersPersister)
      .where({ email })
      .first();
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    return await UsersPersister.createUser(this.context, {
      name,
      phone,
      auth_id: authId,
      email,
    });
  }

  async getCurrentUser(authId: string): Promise<DatabaseUsers | undefined> {
    return await this.context.databaseService
      .query(UsersPersister)
      .where({ auth_id: authId })
      .first();
  }
} 