import axios from '@/lib/axios';
import { APIResponse } from '@/types/api';
import { AccountProfile, UpdateAccountProfilePayload } from '@/types/user';

export const accountService = {
  async getMyProfile(): Promise<AccountProfile> {
    const response = await axios.get<APIResponse<AccountProfile>>('/api/account/me');
    if (!response.data.data) {
      throw new Error('Profile data was not returned');
    }

    return response.data.data;
  },

  async updateMyProfile(payload: UpdateAccountProfilePayload): Promise<AccountProfile> {
    const response = await axios.put<APIResponse<AccountProfile>>('/api/account/me', payload);
    if (!response.data.data) {
      throw new Error('Updated profile data was not returned');
    }

    return response.data.data;
  },
};
