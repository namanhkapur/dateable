import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { supabaseUser, serverUser, loading, isNewUser } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For routes that require authentication
  if (requireAuth) {
    if (!supabaseUser) {
      return <Navigate to="/" replace />;
    }

    if (isNewUser && !serverUser) {
      return <Navigate to="/complete-profile" replace />;
    }

    if (!serverUser) {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  // For public routes (like login/signup), redirect authenticated users to home
  if (!requireAuth && supabaseUser && serverUser) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};