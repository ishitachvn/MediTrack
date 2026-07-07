import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('meditrack_token');
      const storedUser = localStorage.getItem('meditrack_user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          // Fetch fresh user profile from database to confirm token validity
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Session verification failed, logging out:', error);
          localStorage.removeItem('meditrack_token');
          localStorage.removeItem('meditrack_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  // Register User
  const register = async (name, email, password) => {
    // API Call
    const res = await authAPI.register(name, email, password);
    
    // Save locally
    localStorage.setItem('meditrack_token', res.token);
    localStorage.setItem('meditrack_user', JSON.stringify({ _id: res._id, name: res.name, email: res.email }));
    
    setToken(res.token);
    setUser({ _id: res._id, name: res.name, email: res.email });
    
    return res;
  };

  // Login User
  const login = async (email, password) => {
    // API Call
    const res = await authAPI.login(email, password);
    
    // Save locally
    localStorage.setItem('meditrack_token', res.token);
    localStorage.setItem('meditrack_user', JSON.stringify({ _id: res._id, name: res.name, email: res.email }));
    
    setToken(res.token);
    setUser({ _id: res._id, name: res.name, email: res.email });
    
    return res;
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
    setToken(null);
    setUser(null);
  };

  // Update Profile Info
  const updateProfile = async (profileData) => {
    const updatedUser = await authAPI.updateProfile(profileData);
    localStorage.setItem('meditrack_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  // Change Password
  const changePassword = async (oldPassword, newPassword) => {
    // Backend API expects { currentPassword, newPassword }
    await authAPI.changePassword(oldPassword, newPassword);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
