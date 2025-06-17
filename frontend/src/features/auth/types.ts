export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
}

export interface AuthState {
  loading: boolean;
  error: AuthError | null;
}

export interface ServerUser {
  id: number;
  name: string;
  email: string | null;
  authId: string | null;
  phone: string | null;
} 