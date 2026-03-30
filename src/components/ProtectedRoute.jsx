import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import LoadingSpinner from './shared/LoadingSpinner';
import Forbidden from './Forbidden';

export default function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/Home" replace />;
  }

  // Check if user has required role
  const allowedRoles = requiredRoles ? requiredRoles : requiredRole ? [requiredRole] : [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Forbidden />;
  }

  return children;
}