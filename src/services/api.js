import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meditrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

// API Service Interfaces
export const authAPI = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/users/change-password', { currentPassword, newPassword }),
};

export const medicinesAPI = {
  getMedicines: (params) => api.get('/medicines', { params }),
  addMedicine: (medicineData) => api.post('/medicines', medicineData),
  updateMedicine: (id, medicineData) => api.put(`/medicines/${id}`, medicineData),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
  markMedicineTaken: (id, status) => api.put(`/medicines/${id}/taken`, { status }),
};

export const healthAPI = {
  getHealthLogs: (params) => api.get('/health', { params }),
  addHealthLog: (logData) => api.post('/health', logData),
  updateHealthLog: (id, logData) => api.put(`/health/${id}`, logData),
};

export const aiAPI = {
  chat: (question) => api.post('/ai/chat', { question }),
};

export default api;
