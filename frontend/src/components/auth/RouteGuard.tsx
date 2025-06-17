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

  // For public routes, handle authenticated users
  if (!requireAuth && supabaseUser) {
    // If user is authenticated but needs to complete profile
    if (isNewUser || !serverUser) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔀 RouteGuard: Redirecting to complete profile');
      }
      return <Navigate to="/complete-profile" replace />;
    }
    
    // If user is authenticated and has a profile WITH username, redirect to their profile
    if (serverUser?.username) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔀 RouteGuard: Redirecting authenticated user to profile');
      }
      return <Navigate to={`/profile/${serverUser.username}`} replace />;
    }

    // Fallback: profile exists but username missing
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};