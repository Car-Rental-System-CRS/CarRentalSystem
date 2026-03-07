import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    accessToken: (session as any)?.accessToken,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    baseRole: session?.user?.baseRole || 'USER',
    scopes: session?.user?.scopes || [],
    hasScope: (scope: string) => session?.user?.scopes?.includes(scope) ?? false,
  };
}
