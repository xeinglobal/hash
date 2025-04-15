import express from 'express';
import * as depositController from '../controllers/deposit.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Kullanıcı routes
router.post('/create', authenticateToken, depositController.createDeposit);
router.get('/user', authenticateToken, depositController.getUserDeposits);

// Admin routes
router.get('/all', authenticateToken, isAdmin, depositController.getAllDeposits);
router.post('/update-status', authenticateToken, isAdmin, depositController.updateDepositStatus);

export default router; 