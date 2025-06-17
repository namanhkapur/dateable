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
      console.log('🔀 RouteGuard: Redirecting to complete profile');
      return <Navigate to="/complete-profile" replace />;
    }
    
    // If user is authenticated and has a profile, redirect to their profile
    if (serverUser && serverUser.username) {
      console.log('🔀 RouteGuard: Redirecting authenticated user to profile:', serverUser.username);
      return <Navigate to={`/profile/${serverUser.username}`} replace />;
    }
  }
  
  // Debug logging for public routes
  if (!requireAuth) {
    console.log('🔍 RouteGuard: Public route check:', {
      supabaseUser: !!supabaseUser,
      serverUser: !!serverUser,
      username: serverUser?.username,
      isNewUser
    });
  }

  return <>{children}</>;
};