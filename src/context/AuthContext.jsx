import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Initialize Auth State from LocalStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('meditrack_token');
    const storedUser = localStorage.getItem('meditrack_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const getRegisteredUsers = () => {
    const users = localStorage.getItem('meditrack_registered_users');
    if (!users) {
      const demoUsers = [
        {
          id: 'demo_user',
          name: 'Jane Doe',
          email: 'demo@meditrack.org',
          password: 'password123',
          age: '28',
          gender: 'Female',
          bloodGroup: 'O+',
          dailyGoal: 'Stay consistent with my daily medications',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('meditrack_registered_users', JSON.stringify(demoUsers));
      return demoUsers;
    }
    return JSON.parse(users);
  };

  // Helper: Save registered users
  const saveRegisteredUsers = (users) => {
    localStorage.setItem('meditrack_registered_users', JSON.stringify(users));
  };

  // Register Function
  const register = async (name, email, password) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getRegisteredUsers();
    const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      throw new Error('User with this email already exists.');
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email: email.toLowerCase(),
      password, // In a real app, this would be hashed on server
      age: '',
      gender: '',
      bloodGroup: '',
      dailyGoal: 'Stay consistent with my daily medications',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    // Auto-login after registration
    return login(email, password);
  };

  // Login Function
  const login = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = getRegisteredUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid email or password.');
    }

    const mockToken = 'jwt-mock-token-' + Math.random().toString(36).substring(2, 15);
    
    // Omit password when setting current user state
    const { password: _, ...userWithoutPassword } = foundUser;

    localStorage.setItem('meditrack_token', mockToken);
    localStorage.setItem('meditrack_user', JSON.stringify(userWithoutPassword));

    setToken(mockToken);
    setUser(userWithoutPassword);
    
    return userWithoutPassword;
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
    setToken(null);
    setUser(null);
  };

  // Update Profile Info
  const updateProfile = async (profileData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!user) throw new Error('Not authenticated');

    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex === -1) throw new Error('User not found');

    // Update fields in global registry
    users[userIndex] = {
      ...users[userIndex],
      ...profileData,
      email: profileData.email ? profileData.email.toLowerCase() : users[userIndex].email
    };

    saveRegisteredUsers(users);

    // Update active user state
    const { password: _, ...userWithoutPassword } = users[userIndex];
    localStorage.setItem('meditrack_user', JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);

    return userWithoutPassword;
  };

  // Change Password Function
  const changePassword = async (oldPassword, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!user) throw new Error('Not authenticated');

    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex === -1) throw new Error('User not found');
    if (users[userIndex].password !== oldPassword) {
      throw new Error('Incorrect current password.');
    }

    users[userIndex].password = newPassword;
    saveRegisteredUsers(users);
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
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
