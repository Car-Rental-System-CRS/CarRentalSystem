'use client';

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect, createContext, useContext } from 'react';
import { setAuthToken } from '@/lib/axios';
import { AccountProfile } from '@/types/user';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionContextType {
  status: SessionStatus;
  syncProfile: (profile: AccountProfile) => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  status: 'loading',
  syncProfile: async () => {},
});

export const useSessionStatus = () => useContext(SessionContext);

function SessionTokenSync({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

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

  const syncProfile = async (profile: AccountProfile) => {
    await update({
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
        baseRole: profile.baseRole,
        customRoleId: profile.customRole?.id,
        customRoleName: profile.customRole?.name,
        scopes: profile.scopes,
      },
    });
  };

  return (
    <SessionContext.Provider value={{ status, syncProfile }}>
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
