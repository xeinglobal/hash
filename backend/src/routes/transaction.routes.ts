import express from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Kullanıcı routes
router.get('/user', authenticateToken, transactionController.getUserTransactions);
router.get('/user/:type', authenticateToken, transactionController.getUserTransactionsByType);

// Admin routes
router.get('/all', authenticateToken, isAdmin, transactionController.getAllTransactions);
router.get('/all/:type', authenticateToken, isAdmin, transactionController.getAllTransactionsByType);

export default router; 