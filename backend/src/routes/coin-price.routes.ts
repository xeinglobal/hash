import { Router } from 'express';
import { getCurrentCoinPrice, getCoinPriceHistory, updateCoinPrice } from '../controllers/coin-price.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Mevcut coin fiyatını getir (herkes erişebilir)
router.get('/current', getCurrentCoinPrice);

// Coin fiyat geçmişini getir (herkes erişebilir)
router.get('/history', getCoinPriceHistory);

// Yeni coin fiyatı oluştur (sadece admin)
router.post('/update', authenticateToken, isAdmin, updateCoinPrice);

export default router; 