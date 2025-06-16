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