import axios from '@/lib/axios';
import { AccountAdmin, CustomRole } from '@/types/role';

interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const adminService = {
  // ===== USER MANAGEMENT =====
  
  getUsers: async (params: {
    page?: number;
    size?: number;
    search?: string;
    baseRole?: string;
  }): Promise<PageResponse<AccountAdmin>> => {
    const response = await axios.get<APIResponse<PageResponse<AccountAdmin>>>('/api/admin/users', {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        search: params.search || undefined,
        baseRole: params.baseRole || undefined,
      },
    });
    return response.data.data;
  },

  getUserById: async (id: string): Promise<AccountAdmin> => {
    const response = await axios.get<APIResponse<AccountAdmin>>(`/api/admin/users/${id}`);
    return response.data.data;
  },

  assignCustomRole: async (userId: string, customRoleId: string): Promise<AccountAdmin> => {
    const response = await axios.put<APIResponse<AccountAdmin>>(`/api/admin/users/${userId}/role`, {
      customRoleId,
    });
    return response.data.data;
  },

  changeBaseRole: async (userId: string, baseRole: string): Promise<AccountAdmin> => {
    const response = await axios.put<APIResponse<AccountAdmin>>(
      `/api/admin/users/${userId}/base-role`,
      null,
      { params: { baseRole } }
    );
    return response.data.data;
  },

  // ===== ROLE MANAGEMENT =====

  getRoles: async (): Promise<CustomRole[]> => {
    const response = await axios.get<APIResponse<CustomRole[]>>('/api/admin/roles');
    return response.data.data;
  },

  getRoleById: async (id: string): Promise<CustomRole> => {
    const response = await axios.get<APIResponse<CustomRole>>(`/api/admin/roles/${id}`);
    return response.data.data;
  },

  getRolesByBaseRole: async (baseRole: string): Promise<CustomRole[]> => {
    const response = await axios.get<APIResponse<CustomRole[]>>(`/api/admin/roles/by-base-role/${baseRole}`);
    return response.data.data;
  },

  createRole: async (data: {
    name: string;
    description?: string;
    baseRole: string;
    scopes: string[];
  }): Promise<CustomRole> => {
    const response = await axios.post<APIResponse<CustomRole>>('/api/admin/roles', data);
    return response.data.data;
  },

  updateRole: async (id: string, data: {
    name: string;
    description?: string;
    scopes: string[];
  }): Promise<CustomRole> => {
    const response = await axios.put<APIResponse<CustomRole>>(`/api/admin/roles/${id}`, data);
    return response.data.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axios.delete(`/api/admin/roles/${id}`);
  },

  // ===== SCOPE REFERENCE =====

  getAllScopes: async (): Promise<string[]> => {
    const response = await axios.get<APIResponse<string[]>>('/api/admin/scopes');
    return response.data.data;
  },

  getScopesByBaseRole: async (baseRole: string): Promise<string[]> => {
    const response = await axios.get<APIResponse<string[]>>(`/api/admin/scopes/by-base-role/${baseRole}`);
    return response.data.data;
  },
};
