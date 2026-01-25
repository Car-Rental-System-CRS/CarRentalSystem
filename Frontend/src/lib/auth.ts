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
      // Replace with your own authentication logic
      if (!email || !password) {
        return null;
      }
      
      return await authService.signIn(email, password);
    },
  })],
});
