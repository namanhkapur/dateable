import { createHashRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { UploadPage } from '@/features/profile/components/UploadPage';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { RouteErrorBoundary } from '@/components/ui/ErrorBoundary';
import SignupRoute from './routes/signup';
import CompleteProfileRoute from './routes/complete-profile';


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../features/auth/api/auth';

const AuthCallback = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the auth callback by extracting tokens from URL
        const hash = window.location.hash;
        const tokenPart = hash.split('#')[2];

        if (!tokenPart) {
          console.error('No token part found in hash');
          navigate('/', { replace: true });
          return;
        }

        const params = new URLSearchParams(tokenPart);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) {
          console.error('Missing tokens in URL');
          navigate('/', { replace: true });
          return;
        }

        // Set the session - AuthContext will handle the rest
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
          navigate('/', { replace: true });
          return;
        }

        // Navigate to root and let RouteGuard handle the redirect logic
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing login...</p>
      </div>
    </div>
  );
};

export const router = createHashRouter([
  {
    path: '/',
    element: (
      <RouteGuard>
        <LandingPage />
      </RouteGuard>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: (
      <RouteGuard>
        <LoginPage />
      </RouteGuard>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/profile/:username',
    element: (
      <RouteGuard requireAuth>
        <MainLayout />
      </RouteGuard>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <ProfilePage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'upload',
        element: <UploadPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },
  {
    path: '/signup',
    element: (
      <RouteGuard>
        <SignupRoute />
      </RouteGuard>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/complete-profile',
    element: <CompleteProfileRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
    errorElement: <RouteErrorBoundary />,
  },
]); 