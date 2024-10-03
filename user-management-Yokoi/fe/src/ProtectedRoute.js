// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ component: Component }) => {
  const { auth } = useAuth();

  return auth ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;