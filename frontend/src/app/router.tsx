import { createHashRouter, Navigate, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { supabase } from '../features/auth/api/auth';
import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import SignupRoute from './routes/signup';
import CompleteProfileRoute from './routes/complete-profile';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth in ProtectedRoute...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/login', { replace: true });
          return;
        }

        console.log('Session check result:', { 
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });

        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }

        // Check if user info exists in session storage
        const userId = sessionStorage.getItem('userId');
        const userEmail = sessionStorage.getItem('userEmail');
        const userName = sessionStorage.getItem('userName');

        if (!userId || !userEmail || !userName) {
          console.log('Missing user info in session storage, redirecting to complete profile');
          navigate('/complete-profile', { replace: true });
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', { event, hasSession: !!session });
          if (event === 'SIGNED_OUT' || !session) {
            // Clear session storage on sign out
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('userName');
            navigate('/login', { replace: true });
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

// Public route wrapper - redirects to home if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

const AuthCallback = () => {
  const navigate = useNavigate();

  const handleCallback = async () => {
    try {
      // Get the session from the hash fragment
      const hash = window.location.hash;
      console.log('Raw hash:', hash);

      // Extract the tokens from the hash fragment
      // The hash format is: #/auth/callback#access_token=...&refresh_token=...
      const tokenPart = hash.split('#')[2]; // Get the part after the second #
      console.log('Token part:', tokenPart);

      if (!tokenPart) {
        console.error('No token part found in hash');
        navigate('/login', { replace: true });
        return;
      }

      const params = new URLSearchParams(tokenPart);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      console.log('Auth callback params:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken
      });

      if (!accessToken || !refreshToken) {
        console.error('Missing tokens in URL');
        navigate('/login', { replace: true });
        return;
      }

      // Set the session using the tokens
      const { data: { session }, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        navigate('/login', { replace: true });
        return;
      }

      if (!session) {
        console.error('No session returned after setting tokens');
        navigate('/login', { replace: true });
        return;
      }

      console.log('Session set successfully:', { 
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at
      });

      // Store user info in session storage
      sessionStorage.setItem('userId', session.user.id);
      sessionStorage.setItem('userEmail', session.user.email);

      // Check if user has completed their profile in session storage
      const userName = sessionStorage.getItem('userName');
      if (!userName) {
        console.log('No user profile found in session storage, redirecting to complete profile');
        navigate('/complete-profile', { replace: true });
        return;
      }

      // If user exists, redirect to home
      console.log('User profile found in session storage, redirecting to home');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during auth callback:', error);
      navigate('/login', { replace: true });
    }
  };

  React.useEffect(() => {
    handleCallback();
  }, []);

  return <div>Processing login...</div>;
};

export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignupRoute />
      </PublicRoute>
    ),
  },
  {
    path: '/complete-profile',
    element: <CompleteProfileRoute />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
]); 