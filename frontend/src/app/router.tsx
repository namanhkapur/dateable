import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import { LoginPage } from '@/features/auth/components/LoginForm';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { supabase } from '../features/auth/api/auth';
import React from 'react';

const AuthCallback = () => {
  const handleCallback = async () => {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error during auth callback:', error);
    }
    // Redirect to home or dashboard after successful auth
    window.location.href = '/';
  };

  // Call handleCallback when component mounts
  React.useEffect(() => {
    handleCallback();
  }, []);

  return <div>Completing sign in...</div>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout><LandingPage /></MainLayout>,
  },
  {
    path: '/login',
    element: <MainLayout><LoginPage /></MainLayout>,
  },
  {
    path: '/@:username',
    element: <MainLayout><ProfilePage /></MainLayout>,
  },
  {
    path: '/profile',
    element: <MainLayout><ProfilePage /></MainLayout>,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
]); 