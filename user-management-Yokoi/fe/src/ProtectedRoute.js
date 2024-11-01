import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { auth } = useAuth();
  return auth ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
