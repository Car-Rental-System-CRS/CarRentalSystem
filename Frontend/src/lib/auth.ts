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
        
        // Return user with token attached
        return {
          ...user,
          accessToken: token,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
  })],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone = (user as any).phone;
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
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
