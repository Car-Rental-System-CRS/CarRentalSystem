import { toast } from 'sonner';
import { z } from 'zod';
import { AxiosError } from 'axios';

/**
 * Standard error response structure from API
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Error types for better error handling
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Get error type from status code
 */
export const getErrorType = (statusCode?: number): ErrorType => {
  if (!statusCode) return ErrorType.UNKNOWN;

  switch (true) {
    case statusCode >= 400 && statusCode < 500:
      if (statusCode === 401) return ErrorType.AUTHENTICATION;
      if (statusCode === 403) return ErrorType.AUTHORIZATION;
      if (statusCode === 404) return ErrorType.NOT_FOUND;
      if (statusCode === 422) return ErrorType.VALIDATION;
      return ErrorType.VALIDATION;
    case statusCode >= 500:
      return ErrorType.SERVER;
    default:
      return ErrorType.UNKNOWN;
  }
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  // Axios error
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse;
    
    if (apiError?.message) {
      return apiError.message;
    }

    // Handle validation errors
    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0];
      return firstError?.[0] || 'Validation error occurred';
    }

    // Network errors
    if (error.message === 'Network Error') {
      return 'Network error. Please check your internet connection.';
    }

    return error.message || 'An unexpected error occurred';
  }

  // Zod validation error
  if (error instanceof z.ZodError) {
    const firstError = error.issues[0];
    return firstError?.message || 'Validation error';
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Handle errors with toast notifications
 */
export const handleError = (error: unknown, customMessage?: string): void => {
  const message = customMessage || getErrorMessage(error);
  
  // Get error type for different handling
  let errorType = ErrorType.UNKNOWN;
  if (error instanceof AxiosError) {
    errorType = getErrorType(error.response?.status);
  }

  // Show toast based on error type
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
      toast.error('Authentication Failed', {
        description: message,
        duration: 4000,
      });
      break;
    case ErrorType.AUTHORIZATION:
      toast.error('Access Denied', {
        description: message,
        duration: 4000,
      });
      break;
    case ErrorType.VALIDATION:
      toast.error('Validation Error', {
        description: message,
        duration: 4000,
      });
      break;
    case ErrorType.NOT_FOUND:
      toast.error('Not Found', {
        description: message,
        duration: 4000,
      });
      break;
    case ErrorType.NETWORK:
      toast.error('Network Error', {
        description: 'Please check your internet connection and try again.',
        duration: 5000,
      });
      break;
    case ErrorType.SERVER:
      toast.error('Server Error', {
        description: 'Something went wrong on our end. Please try again later.',
        duration: 5000,
      });
      break;
    default:
      toast.error('Error', {
        description: message,
        duration: 4000,
      });
  }

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error);
  }
};

/**
 * Handle success messages
 */
export const handleSuccess = (message: string, description?: string): void => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

/**
 * Show loading toast
 */
export const showLoading = (message: string): string | number => {
  return toast.loading(message);
};

/**
 * Dismiss toast
 */
export const dismissToast = (toastId: string | number): void => {
  toast.dismiss(toastId);
};

/**
 * Promise toast helper
 */
export const handlePromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): void => {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};
