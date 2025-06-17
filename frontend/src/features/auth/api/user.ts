interface CreateUserRequest {
  name: string;
  username?: string;
  email?: string;
  authId?: string;
}

interface CreateUserResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    username: string | null;
    email: string | null;
    authId: string | null;
    phone: string | null;
  };
  message?: string;
}

interface GetUserRequest {
  authId?: string;
  userId?: number;
  username?: string;
  phone?: string;
  email?: string;
}

interface GetUserResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    username: string | null;
    email: string | null;
    authId: string | null;
    phone: string | null;
  };
  message?: string;
}

interface CheckUsernameRequest {
  username: string;
}

interface CheckUsernameResponse {
  success: boolean;
  username: string;
  available: boolean;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const userApi = {
  createUser: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getUser: async (data: GetUserRequest): Promise<GetUserResponse> => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🌐 Making API call to:', `${API_BASE_URL}/users/get`);
    }
    
    const response = await fetch(`${API_BASE_URL}/users/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  },

  checkUsernameAvailability: async (data: CheckUsernameRequest): Promise<CheckUsernameResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/checkUsernameAvailability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message ?? `HTTP ${response.status}`);
    }
    return payload;
  },
};