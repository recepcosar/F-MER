import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import CreateComplaint from './pages/CreateComplaint';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <CreateComplaint />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/complaints/create" 
        element={
          <ProtectedRoute>
            <CreateComplaint />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/overview" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App; 