import { create } from 'zustand';
import apiClient from '@/lib/apiClient';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async () => {
    try {
      const { data } = await apiClient.get('/notifications/unread-count');
      set({ unreadCount: data.data.count });
    } catch {}
  },

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get(`/notifications?page=${page}&limit=20`);
      set({
        notifications: page === 1 ? data.data : [...get().notifications, ...data.data],
        unreadCount: data.meta?.unreadCount ?? get().unreadCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await apiClient.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
