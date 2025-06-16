import { createBrowserRouter } from 'react-router-dom';
import { HomeRoute } from './routes/home';
import { LoginPage } from '../features/auth/pages/LoginPage';
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
    element: <HomeRoute />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
]); 