import api from '@/lib/axios';
import { getServerUrl } from '@/lib/utils';
import { APIResponse } from '@/types/api';
import { DiscountNotificationEvent, DiscountNotificationItem } from '@/types/discountCampaign';

export const discountNotificationService = {
  getAll: async () => {
    const response = await api.get<APIResponse<DiscountNotificationItem[]>>('/api/discount-notifications');
    return response.data.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.post<APIResponse<DiscountNotificationItem>>(`/api/discount-notifications/${notificationId}/read`);
    return response.data.data;
  },

  subscribe: (token: string, onEvent: (event: DiscountNotificationEvent) => void, onError?: () => void) => {
    const source = new EventSource(
      `${getServerUrl()}/api/discount-notifications/stream?access_token=${encodeURIComponent(token)}`
    );

    source.addEventListener('discount-notification', (event) => {
      onEvent(JSON.parse((event as MessageEvent).data));
    });

    source.addEventListener('connected', (event) => {
      onEvent(JSON.parse((event as MessageEvent).data));
    });

    source.onerror = () => {
      onError?.();
    };

    return source;
  },
};
