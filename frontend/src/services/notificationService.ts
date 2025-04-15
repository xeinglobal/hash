import api from './api';
import { Notification } from '../types';

export const NotificationService = {
  // Tüm bildirimleri getir
  getAllNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
      throw error;
    }
  },

  // Okunmamış bildirimleri getir
  getUnreadNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications/unread');
      return response.data;
    } catch (error) {
      console.error('Okunmamış bildirimler alınamadı:', error);
      throw error;
    }
  },

  // Bildirimi okundu olarak işaretle
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
      throw error;
    }
  },

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.put('/notifications/mark-all-read');
    } catch (error) {
      console.error('Bildirimler okundu olarak işaretlenemedi:', error);
      throw error;
    }
  },

  // Bildirim sayısını getir
  getNotificationCount: async (): Promise<{ unreadCount: number }> => {
    try {
      const response = await api.get('/notifications/count');
      return response.data;
    } catch (error) {
      console.error('Bildirim sayısı alınamadı:', error);
      throw error;
    }
  },

  // Bildirim sil
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
      throw error;
    }
  },

  // Tüm bildirimleri sil
  deleteAllNotifications: async (): Promise<void> => {
    try {
      await api.delete('/notifications');
    } catch (error) {
      console.error('Bildirimler silinemedi:', error);
      throw error;
    }
  }
};

export default NotificationService; 