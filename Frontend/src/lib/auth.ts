import { authService } from '@/services/authService';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const { email, password } = credentials as { email: string; password: string };
      
      if (!email || !password) {
        return null;
      }
      
      try {
        const { user, token } = await authService.signIn(email, password);
        
        // Return user with token and role info attached
        return {
          ...user,
          accessToken: token,
          baseRole: user.baseRole,
          customRoleId: user.customRole?.id,
          customRoleName: user.customRole?.name,
          scopes: user.scopes,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
  })],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone = (user as any).phone;
        token.baseRole = (user as any).baseRole;
        token.customRoleId = (user as any).customRoleId;
        token.customRoleName = (user as any).customRoleName;
        token.scopes = (user as any).scopes;
      }

      if (trigger === 'update' && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.phone = session.user.phone;
        token.baseRole = session.user.baseRole;
        token.scopes = session.user.scopes;
        token.customRoleId = session.user.customRoleId;
        token.customRoleName = session.user.customRoleName;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.phone = token.phone as string;
        session.user.baseRole = (token.baseRole as 'USER' | 'STAFF' | 'ADMIN') || 'USER';
        session.user.customRoleId = token.customRoleId as string | undefined;
        session.user.customRoleName = token.customRoleName as string | undefined;
        session.user.scopes = (token.scopes as string[]) || [];
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
