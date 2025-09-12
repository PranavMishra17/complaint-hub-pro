import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = ['admin', 'agent'] 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute: Evaluating access', {
    currentPath: location.pathname,
    loading,
    hasUser: !!user,
    userRole: user?.role,
    requiredRoles,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🚪 ProtectedRoute: No user found, redirecting to login', {
      from: location.pathname,
      redirectTo: '/admin/login',
      timestamp: new Date().toISOString()
    });
    // Redirect to login with the current location
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    console.log('⛔ ProtectedRoute: User lacks required role', {
      userRole: user.role,
      requiredRoles,
      timestamp: new Date().toISOString()
    });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  console.log('✅ ProtectedRoute: Access granted, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;