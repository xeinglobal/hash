import { Router } from 'express';
import { buyCoin, convertCoinToBalance, getConversionStatus } from '../controllers/coin.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Coin satın alma
router.post('/buy', authenticateToken, buyCoin);

// Coin bozdurma
router.post('/convert', authenticateToken, convertCoinToBalance);

// Coin bozdurma durumunu getir
router.get('/conversion-status', getConversionStatus);

export default router; 