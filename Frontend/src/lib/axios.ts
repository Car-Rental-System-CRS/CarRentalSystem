import { getServerUrl } from '@/lib/utils';
import axios from 'axios';

const instance = axios.create({
  baseURL: getServerUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
instance.interceptors.request.use(
  (config) => {
    // For client-side requests in browser
    if (typeof window !== 'undefined') {
      // Try to get token from sessionStorage or localStorage if needed
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
        // Optionally redirect to login
        // window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
