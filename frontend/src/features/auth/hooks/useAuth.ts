import { useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import type { AuthState } from '../types';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    loading: false,
    error: null,
  });

  const signInWithMagicLink = useCallback(async (email: string) => {
    setState({ loading: true, error: null });
    try {
      await authApi.signInWithMagicLink(email);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error: { message: error instanceof Error ? error.message : 'An error occurred' },
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      await authApi.signOut();
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error: { message: error instanceof Error ? error.message : 'An error occurred' },
      });
    }
  }, []);

  return {
    ...state,
    signInWithMagicLink,
    signOut,
  };
}; 