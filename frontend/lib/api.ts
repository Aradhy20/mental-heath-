import axios from 'axios';

// API Configuration
// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS cookies
});

// Request Interceptor (Add Token)
api.interceptors.request.use(
  (config) => {
    // Client-side only
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Handle Errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Optional: Redirect to login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  requestOTP: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
  getMe: () => api.get('/auth/me'),
};

export const analysisAPI = {
  analyzeText: (text: string, userId: string = '1') => api.post('/analysis/text', { text, user_id: userId }),
  analyzeTextContextual: (text: string, userId: string = '1') => api.post('/analysis/text/contextual', { text, user_id: userId }),
  analyzeFace: (imageData: string, userId: string = '1') => api.post('/analysis/face', { image: imageData, user_id: userId }),
  analyzeVoice: (audioBlob: Blob, userId: string = '1') => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('user_id', userId);
    return api.post('/analysis/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getWellnessScore: (data: any) => api.post('/analysis/fuzzy', data),
};

export const doctorsAPI = {
  getNearby: (lat: number, lon: number, maxDistance: number = 50000) =>
    api.post('/doctors/nearby', { lat, lon, maxDistance }),
};

export const userAPI = {
  getDashboardStats: () => api.get('/users/dashboard-stats'),
};

export default api;