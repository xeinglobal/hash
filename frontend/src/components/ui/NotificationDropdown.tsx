"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '@/types';
import { useNotifications } from '@/contexts/NotificationContext';
import { BellIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mobile device check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Notification title color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'referral':
        return 'text-blue-400';
      case 'stake':
        return 'text-teal-400';
      case 'bonus':
        return 'text-purple-400';
      default:
        return 'text-gray-200';
    }
  };

  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: enUS });
    } catch (error) {
      return 'unknown time';
    }
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark notification as read - with error handling
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Continue silently in case of error
    }
  };

  // Mark all notifications as read - with error handling
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Continue silently in case of error
    }
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'relative'}`} ref={dropdownRef}>
      {/* Notification button (hidden on mobile) */}
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-1 text-gray-200 hover:text-teal-400 transition-colors duration-150 focus:outline-none"
        >
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Mobile only icon and unread count */}
      {isMobile && (
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center cursor-pointer"
        >
          <BellIcon className="h-6 w-6 text-gray-200 hover:text-teal-400 transition-colors duration-150" />
          {unreadCount > 0 && (
            <span className="ml-2 text-xs font-bold text-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )}

      {isOpen && (
        <div className={`${isMobile ? 'fixed inset-x-0 top-16 mx-4' : 'absolute right-0'} mt-2 w-80 bg-gray-900 text-white rounded-md shadow-lg overflow-hidden z-50 ${isMobile ? 'mx-auto' : ''} border border-gray-700`}>
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gray-800">
            <h3 className="text-sm font-medium text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors duration-150"
              >
                Mark All as Read
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {!notifications || notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                You have no notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150 ${
                    !notification.isRead ? 'bg-gray-800/80' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-300 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="ml-2 text-teal-400 hover:text-teal-300 transition-colors duration-150"
                        title="Mark as read"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 