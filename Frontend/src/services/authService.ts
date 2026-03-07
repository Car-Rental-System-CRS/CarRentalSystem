import { signOut } from "@/lib/auth";
import { User } from "@/types/user";
import axios from "@/lib/axios";

interface LoginResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

interface AccountResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    baseRole: 'USER' | 'STAFF' | 'ADMIN';
    customRole: {
      id: string;
      name: string;
    } | null;
    scopes: string[];
  };
  timestamp: string;
}

export const authService = {
  signIn: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await axios.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    // Extract JWT token from Authorization header
    const authHeader = response.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token received from server');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Fetch user details using the token
    const userResponse = await axios.get<AccountResponse>('/api/account/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = userResponse.data.data;
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      baseRole: userData.baseRole,
      customRole: userData.customRole,
      scopes: userData.scopes,
    };

    return { user, token };
  },

  signOut: async (token?: string) => {
    if (token) {
      try {
        await axios.post('/api/auth/logout', null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    await signOut({ redirectTo: '/' });
  },

  signUp: async (name: string, email: string, password: string, phone: string): Promise<void> => {
    await axios.post<RegisterResponse>('/api/auth/register', {
      name,
      email,
      password,
      phone,
    });
  },
}