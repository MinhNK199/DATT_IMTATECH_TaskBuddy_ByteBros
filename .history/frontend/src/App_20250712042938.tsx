import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Dashboard, Users, Tasks as AdminTasks, Reports, AdminLayout } from './admin';

// Client components
import ClientLayout from './client/ClientLayout';
import TaskClient from './client/TaskClient';
import Login from './client/Login';
import Register from './client/Register';
import Profile from './client/Profile';

// Auth check HOC
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Client routes - protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<TaskClient />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin routes - protected */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
