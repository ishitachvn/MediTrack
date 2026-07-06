import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MedsProvider } from './context/MedsContext';
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';
import HealthTracker from './pages/HealthTracker';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner-loader"></div>
        <p>Verifying session details...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Authenticated Redirect Wrapper (Send logged in users straight to dashboard)
const AuthRedirectRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner-loader"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <>
      <Navbar />
      <main className="main-content-layout">
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Home />} />
          
          <Route 
            path="/login" 
            element={
              <AuthRedirectRoute>
                <Login />
              </AuthRedirectRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthRedirectRoute>
                <Register />
              </AuthRedirectRoute>
            } 
          />

          {/* Protected Routing */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-medicine" 
            element={
              <ProtectedRoute>
                <AddMedicine />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-medicine/:id" 
            element={
              <ProtectedRoute>
                <EditMedicine />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/health-tracker" 
            element={
              <ProtectedRoute>
                <HealthTracker />
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

          {/* 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MedsProvider>
          <AppContent />
        </MedsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
