'use client';

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect, createContext, useContext } from 'react';
import { setAuthToken } from '@/lib/axios';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionContextType {
  status: SessionStatus;
}

const SessionContext = createContext<SessionContextType>({ status: 'loading' });

export const useSessionStatus = () => useContext(SessionContext);

function SessionTokenSync({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only sync once the session status is determined (not loading)
    if (status === 'loading') {
      return;
    }
    
    // Sync the access token with axios interceptor
    if (session?.accessToken) {
      setAuthToken(session.accessToken as string);
    } else {
      setAuthToken(null);
    }
  }, [session, status]);

  return (
    <SessionContext.Provider value={{ status }}>
      {children}
    </SessionContext.Provider>
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SessionTokenSync>
        {children}
      </SessionTokenSync>
    </NextAuthSessionProvider>
  );
}
