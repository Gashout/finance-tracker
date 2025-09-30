/**
 * @file App.tsx
 * @description Main application component that handles routing
 * 
 * This component:
 * - Defines the application's route structure
 * - Separates public routes (login, register) from protected routes
 * - Applies the Layout component to authenticated routes
 * - Handles 404 routes
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import Page Components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import { TransactionPage } from './pages/transactions';
import { Layout } from './components/layout';
import { BudgetPage } from './pages/budgets/BudgetPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import { CategoryPage } from './pages/categories';

// Page Components

// Removed unused Transactions component


// Categories component replaced with CategoryPage imported from './pages/categories'

// Profile component replaced with ProfilePage

/**
 * @component Settings
 * @description Application settings page
 */
const Settings = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p>Manage your application settings here.</p>
  </div>
);

/**
 * @component NotFound
 * @description 404 page for routes that don't exist
 */
const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Not Found</h1>
    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
    <a 
      href="/" 
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Go to Dashboard
    </a>
  </div>
);

/**
 * @component App
 * @description Main application component
 * 
 * This component defines the routing structure of the application:
 * - Public routes (login, register) are accessible without authentication
 * - Protected routes are wrapped in the Layout component which:
 *   1. Checks authentication status
 *   2. Provides consistent UI with header and sidebar
 *   3. Handles responsive behavior
 * 
 * @returns {JSX.Element} The application with routing
 */
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Public Routes - No layout wrapper */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
        
        {/* Protected Routes - With layout wrapper */}
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Main feature routes */}
          <Route path="/transactions" element={<TransactionPage />} />
          <Route path="/budgets" element={<BudgetPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          
          {/* User routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
