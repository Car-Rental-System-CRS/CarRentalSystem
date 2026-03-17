import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      baseRole: 'USER' | 'STAFF' | 'ADMIN';
      customRoleId?: string;
      customRoleName?: string;
      scopes: string[];
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    accessToken?: string;
    baseRole?: 'USER' | 'STAFF' | 'ADMIN';
    customRoleId?: string;
    customRoleName?: string;
    scopes?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;
    baseRole?: 'USER' | 'STAFF' | 'ADMIN';
    customRoleId?: string;
    customRoleName?: string;
    scopes?: string[];
  }
}
