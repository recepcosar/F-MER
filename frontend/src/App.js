import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
<<<<<<< HEAD
=======
import Register from './pages/Register';
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
<<<<<<< HEAD
=======
      <Route path="/register" element={<Register />} />
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
      <Route 
        path="/dashboard" 
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