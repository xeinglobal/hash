import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import mongoose from 'mongoose';

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    // Get notifications from the last 30 days, newest first
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20); // Last 20 notifications

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    // Find notification and ensure it belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Mark notification as read
    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    // Mark all user notifications as read
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Helper function to create notifications (can be used by other controllers)
export const createNotification = async (
  userId: string | mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: 'referral' | 'stake' | 'bonus' | 'system'
) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      isRead: false
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}; 