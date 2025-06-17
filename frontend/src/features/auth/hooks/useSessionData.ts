import { useAuth } from '../context/AuthContext';

/**
 * Hook to access session data for display purposes
 * This provides a clean interface to user data without triggering network calls
 */
export const useSessionData = () => {
  const { serverUser, supabaseUser, isNewUser, loading } = useAuth();

  return {
    // User display information
    userName: serverUser?.name || supabaseUser?.user_metadata?.name || 'User',
    userEmail: serverUser?.email || supabaseUser?.email || null,
    userId: serverUser?.id || null,
    authId: supabaseUser?.id || null,
    
    // Auth state
    isAuthenticated: !!supabaseUser,
    hasServerProfile: !!serverUser,
    isNewUser,
    loading,
    
    // Full objects if needed
    serverUser,
    supabaseUser,
  };
};