import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    return <Navigate to="/" replace />;
  }
  
  // Kullanıcı giriş yapmışsa, geçerli sayfaya erişim izni ver
  return children;
};

export default ProtectedRoute; 