import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../api/auth';
import { userApi } from '../api/user';
import { ServerUser } from '../types';

interface AuthContextType {
  supabaseUser: User | null;
  serverUser: ServerUser | null;
  loading: boolean;
  error: Error | null;
  isNewUser: boolean;
  refreshUser: () => Promise<void>;
  clearSession: () => void;
}

// Session storage keys
const SESSION_KEYS = {
  SERVER_USER: 'dateable_server_user',
  IS_NEW_USER: 'dateable_is_new_user',
  LAST_FETCH: 'dateable_last_fetch',
} as const;

const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  serverUser: null,
  loading: true,
  error: null,
  isNewUser: false,
  refreshUser: async () => {},
  clearSession: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [serverUser, setServerUser] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Session storage utilities
  const saveSessionData = (user: ServerUser | null, isNew: boolean) => {
    if (user) {
      sessionStorage.setItem(SESSION_KEYS.SERVER_USER, JSON.stringify(user));
      sessionStorage.setItem(SESSION_KEYS.IS_NEW_USER, JSON.stringify(isNew));
      sessionStorage.setItem(SESSION_KEYS.LAST_FETCH, Date.now().toString());
    } else {
      sessionStorage.removeItem(SESSION_KEYS.SERVER_USER);
      sessionStorage.setItem(SESSION_KEYS.IS_NEW_USER, JSON.stringify(isNew));
    }
  };

  const loadSessionData = (): { user: ServerUser | null; isNew: boolean; lastFetch: number } => {
    try {
      const userJson = sessionStorage.getItem(SESSION_KEYS.SERVER_USER);
      const isNewJson = sessionStorage.getItem(SESSION_KEYS.IS_NEW_USER);
      const lastFetchStr = sessionStorage.getItem(SESSION_KEYS.LAST_FETCH);
      
      return {
        user: userJson ? JSON.parse(userJson) : null,
        isNew: isNewJson ? JSON.parse(isNewJson) : false,
        lastFetch: lastFetchStr ? parseInt(lastFetchStr) : 0,
      };
    } catch {
      return { user: null, isNew: false, lastFetch: 0 };
    }
  };

  const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEYS.SERVER_USER);
    sessionStorage.removeItem(SESSION_KEYS.IS_NEW_USER);
    sessionStorage.removeItem(SESSION_KEYS.LAST_FETCH);
    setServerUser(null);
    setIsNewUser(false);
  };

  // Only fetch from server if not in session storage or data is stale
  const fetchServerUser = async (supabaseUser: any, force = false) => {
    const { user: cachedUser, isNew: cachedIsNew, lastFetch } = loadSessionData();
    const isStale = Date.now() - lastFetch > 5 * 60 * 1000; // 5 minutes

    // Use cached data if available and not stale, unless forced
    if (!force && cachedUser && !isStale) {
      console.log('📦 Using cached server user data');
      setServerUser(cachedUser);
      setIsNewUser(cachedIsNew);
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Fetching server user from API');
    }
    
    try {
      // First, try to find user by authId
      let response = await userApi.getUser({ authId: supabaseUser.id });
      
      // If not found by authId, try by email
      if (!response.success || !response.user) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔄 AuthId lookup failed, trying email lookup...');
        }
        if (supabaseUser.email) {
          response = await userApi.getUser({ email: supabaseUser.email });
        }
      }
      
      if (response.success && response.user) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Server user found');
        }
        setServerUser(response.user);
        setIsNewUser(false);
        saveSessionData(response.user, false);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('❌ Server user not found, marking as new user');
        }
        setServerUser(null);
        setIsNewUser(true);
        saveSessionData(null, true);
      }
    } catch (err) {
      console.error('Error fetching server user:', err);
      setServerUser(null);
      setIsNewUser(true);
      saveSessionData(null, true);
    }
  };

  const refreshUser = async () => {
    if (supabaseUser) {
      await fetchServerUser(supabaseUser, true); // Force refresh
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🚀 AuthContext initializing...');
    }
    
    // Clean up legacy sessionStorage keys (one-time cleanup)
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId');
    
    // First, try to load cached session data
    const { user: cachedUser, isNew: cachedIsNew } = loadSessionData();
    if (cachedUser) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('📦 Loading cached session data');
      }
      setServerUser(cachedUser);
      setIsNewUser(cachedIsNew);
    }

    // Get initial Supabase session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('📋 Initial session check:', { hasSession: !!session, hasError: !!error });
      }
      if (error) {
        console.error('Session error:', error);
        setError(error);
        clearSession();
        setLoading(false);
      } else if (session?.user) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('👤 Found Supabase user');
        }
        setSupabaseUser(session.user);
        // Fetch server user (will use cache if available and fresh)
        await fetchServerUser(session.user);
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Initial auth check complete');
        }
        setLoading(false);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('🚫 No session found');
        }
        setSupabaseUser(null);
        clearSession();
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Auth state changed:', _event, { hasSession: !!session });
      }
      if (session?.user) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('👤 Auth state: user logged in');
        }
        setSupabaseUser(session.user);
        // For auth changes, we want fresh data (user might have completed profile)
        await fetchServerUser(session.user, true);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('🚫 Auth state: user logged out');
        }
        setSupabaseUser(null);
        clearSession();
      }
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Auth state change complete');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ supabaseUser, serverUser, loading, error, isNewUser, refreshUser, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 