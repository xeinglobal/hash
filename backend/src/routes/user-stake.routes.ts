import express from 'express';
import { 
  getAllUserStakes, 
  getUserStakes, 
  getUserStakeById, 
  createUserStake, 
  completeUserStake,
  distributeStakeDailyProfits,
  autoCompleteExpiredStakes,
  testStakeCalculations
} from '../controllers/user-stake.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Admin routes
router.get('/admin/all', authenticateToken, isAdmin, getAllUserStakes);
router.post('/admin/:id/complete', authenticateToken, isAdmin, completeUserStake);

// Test routes - sadece development ortamında erişilebilir
if (process.env.NODE_ENV === 'development') {
  router.get('/test-calculations', testStakeCalculations);
  // Manuel tetikleme endpoint'leri
  router.post('/admin/trigger-daily-profits', authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log('Günlük stake kazançları manuel olarak tetikleniyor...');
      const result = await distributeStakeDailyProfits();
      res.json({ message: 'Günlük stake kazançları dağıtıldı', result });
    } catch (error) {
      console.error('Manuel tetikleme hatası:', error);
      res.status(500).json({ message: 'İşlem sırasında hata oluştu', error });
    }
  });

  router.post('/admin/trigger-complete-expired', authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log('Süresi dolan stake işlemleri manuel olarak tamamlanıyor...');
      const result = await autoCompleteExpiredStakes();
      res.json({ message: 'Süresi dolan stake işlemleri tamamlandı', result });
    } catch (error) {
      console.error('Manuel tetikleme hatası:', error);
      res.status(500).json({ message: 'İşlem sırasında hata oluştu', error });
    }
  });
}

// User routes
router.get('/', authenticateToken, getUserStakes);
router.get('/:id', authenticateToken, getUserStakeById);
router.post('/', authenticateToken, createUserStake);

export default router; 