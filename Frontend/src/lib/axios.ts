import { getServerUrl } from '@/lib/utils';
import axios from 'axios';

const instance = axios.create({
  baseURL: getServerUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for client-side session token and loading state
let clientToken: string | null = null;
let sessionLoadState: 'loading' | 'ready' = 'loading';

// Promise resolver for waiting on session
let sessionReadyResolve: (() => void) | null = null;
let sessionReadyPromise = new Promise<void>((resolve) => {
  sessionReadyResolve = resolve;
});

// Function to set token (called by SessionProvider after getting session)
export const setAuthToken = (token: string | null) => {
  clientToken = token;
  if (sessionLoadState === 'loading') {
    sessionLoadState = 'ready';
    sessionReadyResolve?.();
  }
};

// Check if session is ready for authenticated requests
export const isAuthReady = () => sessionLoadState === 'ready';

// Wait for session to be ready (useful for initial page load)
const waitForSession = async (maxWait = 5000): Promise<void> => {
  if (sessionLoadState === 'ready') {
    return Promise.resolve();
  }
  
  // Race between session ready and timeout
  return Promise.race([
    sessionReadyPromise,
    new Promise<void>((resolve) => setTimeout(resolve, maxWait))
  ]);
};

// Request interceptor to add token to requests
instance.interceptors.request.use(
  async (config) => {
    // For client-side requests in browser
    if (typeof window !== 'undefined') {
      // Wait for session to be ready (with timeout)
      await waitForSession();
      
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
      if (typeof window !== 'undefined' && sessionLoadState === 'ready') {
        clientToken = null;
        // Redirect to login
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
