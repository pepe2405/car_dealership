import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Sell from './pages/Sell';
import About from './pages/About';
import Navbar from './components/layout/Navbar';
import authService from './services/authService';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminCars from './pages/AdminCars';
import AdminCarsView from './pages/AdminCarsView';
import AdminDeposits from './pages/AdminDeposits';
import OwnerDeposits from './pages/OwnerDeposits';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import TestDrives from './pages/TestDrives';
import Forums from './pages/Forums';
import ForumDetail from './components/forum/ForumDetail';
import Leasing from './pages/Leasing';
import Deposits from './pages/Deposits';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!authService.getCurrentUser());
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleRegister = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/forums" element={<Forums />} />
        <Route path="/forums/:id" element={<ForumDetail />} />
        <Route path="/leasing" element={<Leasing />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        
        {/* Protected route for selling a car - Seller role only */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute roles={['seller']}>
              <Sell />
            </ProtectedRoute>
          }
        />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminCars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars-view"
          element={
            <ProtectedRoute roles={['admin', 'seller']}>
              <AdminCarsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deposits"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDeposits />
            </ProtectedRoute>
          }
        />
        
        {/* Messages route */}
        <Route path="/messages" element={<Messages />} />
        
        {/* Favorites route - for buyers only */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute roles={['buyer']}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        
        {/* Test Drives route */}
        <Route path="/test-drives" element={<TestDrives />} />
        
        {/* Deposits route - for buyers only */}
        <Route
          path="/deposits"
          element={
            <ProtectedRoute roles={['buyer']}>
              <Deposits />
            </ProtectedRoute>
          }
        />
        
        {/* Owner Deposits route - for car owners */}
        <Route
          path="/owner/deposits"
          element={
            <ProtectedRoute roles={['seller']}>
              <OwnerDeposits />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
