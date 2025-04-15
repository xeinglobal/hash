"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await api.get('/notifications');
      
      setNotifications(response.data);
      
      // Calculate unread notification count
      const unread = response.data.filter((notification: Notification) => !notification.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use empty array when there's an error with notifications but don't affect auth state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      
      // Update notifications
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      
      // Decrease unread notification count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Continue silently in case of error, don't affect auth state
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      
      // Update all notifications as read
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      
      // Reset unread notification count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Continue silently in case of error, don't affect auth state
    }
  };

  // Fetch notifications when user logs in and component mounts
  useEffect(() => {
    if (isAuthenticated) {
      try {
        fetchNotifications();
      } catch (error) {
        console.error('Error in notification fetch useEffect:', error);
        // Continue silently if there's an error with notifications
      }
    }
  }, [isAuthenticated]);

  // Periodically update notifications (every 1 minute)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      try {
        fetchNotifications();
      } catch (error) {
        console.error('Error in periodic notification fetch:', error);
        // Continue silently if there's an error with notifications
      }
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 