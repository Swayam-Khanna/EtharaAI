import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-600 animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm animate-pulse">Verifying workspace session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
