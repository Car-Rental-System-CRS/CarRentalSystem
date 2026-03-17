export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  baseRole?: 'USER' | 'STAFF' | 'ADMIN';
  customRole?: {
    id: string;
    name: string;
  } | null;
  scopes?: string[];
};

export type AccountProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  baseRole: 'USER' | 'STAFF' | 'ADMIN';
  customRole?: {
    id: string;
    name: string;
  } | null;
  scopes: string[];
};

export type UpdateAccountProfilePayload = {
  name: string;
  email: string;
  phone?: string;
};
