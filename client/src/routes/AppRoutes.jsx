import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages imports
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import Tasks from '../pages/Tasks';
import TeamManagement from '../pages/TeamManagement';
import Profile from '../pages/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Workspace Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="tasks" element={<Tasks />} />
        
        {/* Admin Only Route */}
        <Route
          path="team"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
        
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
