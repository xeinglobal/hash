import express from 'express';
import * as withdrawalController from '../controllers/withdrawal.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Kullanıcı routes
router.post('/create', authenticateToken, withdrawalController.createWithdrawal);
router.get('/user', authenticateToken, withdrawalController.getUserWithdrawals);

// Admin routes
router.get('/all', authenticateToken, isAdmin, withdrawalController.getAllWithdrawals);
router.post('/update-status', authenticateToken, isAdmin, withdrawalController.updateWithdrawalStatus);

export default router; 