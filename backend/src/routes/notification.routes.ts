import express from 'express';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Add auth middleware for all routes
router.use(authenticateToken);

// Get user notifications
router.get('/', getUserNotifications);

// Mark notification as read
router.post('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.post('/read-all', markAllNotificationsAsRead);

export default router; 