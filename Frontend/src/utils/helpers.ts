import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

export const getServerUrl = () => {
  return process.env.NEXT_PUBLIC_SERVER_URL ? 
    process.env.NEXT_PUBLIC_SERVER_URL : 'http://localhost:8080';
};



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
