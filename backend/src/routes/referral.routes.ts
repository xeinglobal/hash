import { Router } from 'express';
import { getUserReferralInfo, getReferralStakes, getReferralSystemStats } from '../controllers/referral.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Tüm rotalar için authentication gerekli
router.use(authenticateToken);

// Kullanıcı referral bilgilerini getir
router.get('/info', getUserReferralInfo);

// Kullanıcının referanslarının stake durumlarını getir
router.get('/stakes', getReferralStakes);

// Tüm referans sistemi istatistiklerini getir (Admin için)
router.get('/stats', getReferralSystemStats);

export default router; 