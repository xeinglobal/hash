import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  requestPasswordReset, 
  validateResetToken, 
  resetPassword 
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Auth debugger middleware ekleyelim
router.use((req, res, next) => {
  console.log(`Auth Route: ${req.method} ${req.url}`);
  console.log('Auth Headers:', JSON.stringify(req.headers));
  next();
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

// Şifre sıfırlama route'ları
router.post('/forgot-password', requestPasswordReset);
router.get('/reset-password/validate/:token', validateResetToken);
router.post('/reset-password', resetPassword);

export default router; 