import { api } from '../index';
import { Notification } from './types';

export const notificationsApi = {
  getAll: async (userId: string) => {
    const response = await api.get<Notification[]>(`/notifications/${userId}`);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (userId: string) => {
    const response = await api.patch<{ count: number }>(`/notifications/user/${userId}/read-all`);
    return response.data;
  },

  // Optional: Trigger birthday check manually (for testing/admin)
  triggerBirthdays: async () => {
    const response = await api.post<{ message: string }>('/notifications/trigger-birthdays');
    return response.data;
  }
};
