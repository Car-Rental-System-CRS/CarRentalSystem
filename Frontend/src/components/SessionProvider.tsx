'use client';

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect, createContext, useContext } from 'react';
import axios from '@/lib/axios';
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

const normalizeScopes = (scopes: string[] | undefined) => [...(scopes ?? [])].sort();

const profilesMatchSession = (session: NonNullable<ReturnType<typeof useSession>['data']>, profile: AccountProfile) => {
  const currentScopes = normalizeScopes(session.user.scopes);
  const nextScopes = normalizeScopes(profile.scopes);

  return session.user.id === profile.id
    && session.user.name === profile.name
    && session.user.email === profile.email
    && session.user.phone === (profile.phone ?? '')
    && session.user.baseRole === profile.baseRole
    && session.user.customRoleId === profile.customRole?.id
    && session.user.customRoleName === profile.customRole?.name
    && currentScopes.length === nextScopes.length
    && currentScopes.every((scope, index) => scope === nextScopes[index]);
};

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

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken || !session.user) {
      return;
    }

    let cancelled = false;

    const refreshProfile = async () => {
      try {
        const response = await axios.get<{ data: AccountProfile }>('/api/account/me', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (cancelled) {
          return;
        }

        const profile = response.data.data;
        if (profilesMatchSession(session, profile)) {
          return;
        }

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
      } catch (error) {
        console.error('Failed to refresh session profile:', error);
      }
    };

    refreshProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, status, update]);

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
