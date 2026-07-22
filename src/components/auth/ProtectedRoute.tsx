
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we set things up</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    const dashboardMap: Record<string, string> = {
      student: '/dashboard',
      teacher: '/teacher',
      content_creator: '/content-creator',
      parent: '/parent',
      admin: '/super-admin',
      marketing: '/marketing',
    };
    // Fall back to /dashboard (smart router) — NEVER /student — so a user
    // whose role hasn't hydrated yet isn't dropped into the student funnel.
    return <Navigate to={dashboardMap[user.role] || '/dashboard'} replace />;
  }

  // Handle generic /dashboard redirect
  if (!requiredRole && window.location.pathname === '/dashboard') {
    const dashboardMap: Record<string, string> = {
      student: '/dashboard',
      teacher: '/teacher',
      content_creator: '/content-creator',
      parent: '/parent',
      admin: '/super-admin',
      marketing: '/marketing',
    };
    return <Navigate to={dashboardMap[user.role] || '/dashboard'} replace />;
  }

  return <>{children}</>;
};
