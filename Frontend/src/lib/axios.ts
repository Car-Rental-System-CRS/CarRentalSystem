import { getServerUrl } from '@/lib/utils';
import axios from 'axios';

const instance = axios.create({
  baseURL: getServerUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for client-side session token
let clientToken: string | null = null;
let isSessionLoading = true;

// Function to set token (called by components after getting session)
export const setAuthToken = (token: string | null) => {
  clientToken = token;
  isSessionLoading = false;
};

// Check if session is ready for authenticated requests
export const isAuthReady = () => !isSessionLoading;

// Request interceptor to add token to requests
instance.interceptors.request.use(
  async (config) => {
    // For client-side requests in browser
    if (typeof window !== 'undefined') {
      // Use the token set by SessionProvider
      if (clientToken) {
        config.headers.Authorization = `Bearer ${clientToken}`;
      }
    } else {
      // For server-side requests, try to get session from Next-Auth
      try {
        // Dynamic import to avoid circular dependencies
        const { auth } = await import('@/lib/auth');
        const session = await auth();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        // Session not available on server side
        console.error('Failed to get server session:', error);
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
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Only redirect if session has finished loading (not during initial page load)
      if (typeof window !== 'undefined' && !isSessionLoading) {
        clientToken = null;
        // Redirect to login
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
