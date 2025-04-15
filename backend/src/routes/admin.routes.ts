import express from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';
import * as depositController from '../controllers/deposit.controller';
import * as withdrawalController from '../controllers/withdrawal.controller';
import * as coinPriceController from '../controllers/coin-price.controller';

const router = express.Router();

// Tüm admin route'ları için kimlik doğrulama ve admin kontrolü middleware'leri
router.use(authenticateToken, isAdmin);

// Admin dashboard ve istatistikleri
router.get('/dashboard', adminController.getDashboardStats);

// Kullanıcı yönetimi
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.get('/users/:id/transactions', adminController.getUserTransactions);
router.post('/users/:id/toggle-verification', adminController.toggleUserVerification);

// Para yatırma işlemleri
router.get('/deposits', depositController.getAllDeposits);

// Para yatırma işlemini onayla
router.post('/deposits/:id/approve', async (req, res) => {
  try {
    console.log(`Deposit approval request for ID: ${req.params.id}`);
    req.body.depositId = req.params.id;
    req.body.status = 'approved';
    await depositController.updateDepositStatus(req, res);
  } catch (error) {
    console.error('Error in deposit approval route:', error);
    res.status(500).json({ message: 'Onaylama sırasında bir hata oluştu' });
  }
});

// Para yatırma işlemini reddet
router.post('/deposits/:id/reject', async (req, res) => {
  try {
    console.log(`Deposit rejection request for ID: ${req.params.id}`);
    req.body.depositId = req.params.id;
    req.body.status = 'rejected';
    await depositController.updateDepositStatus(req, res);
  } catch (error) {
    console.error('Error in deposit rejection route:', error);
    res.status(500).json({ message: 'Reddetme sırasında bir hata oluştu' });
  }
});

// Para çekme işlemleri  
router.get('/withdrawals', withdrawalController.getAllWithdrawals);

// Para çekme işlemini onayla
router.post('/withdrawals/:id/approve', async (req, res) => {
  try {
    console.log(`Withdrawal approval request for ID: ${req.params.id}, txHash: ${req.body.txHash}`);
    req.body.withdrawalId = req.params.id;
    req.body.status = 'approved';
    req.body.txHash = req.body.txHash || '';
    await withdrawalController.updateWithdrawalStatus(req, res);
  } catch (error) {
    console.error('Error in withdrawal approval route:', error);
    res.status(500).json({ message: 'Onaylama sırasında bir hata oluştu' });
  }
});

// Para çekme işlemini reddet
router.post('/withdrawals/:id/reject', async (req, res) => {
  try {
    console.log(`Withdrawal rejection request for ID: ${req.params.id}`);
    req.body.withdrawalId = req.params.id;
    req.body.status = 'rejected';
    await withdrawalController.updateWithdrawalStatus(req, res);
  } catch (error) {
    console.error('Error in withdrawal rejection route:', error);
    res.status(500).json({ message: 'Reddetme sırasında bir hata oluştu' });
  }
});

// Sistem ayarları
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Coin fiyatı yönetimi
router.get('/coin-price', coinPriceController.getCurrentCoinPrice);
router.get('/coin-price/history', coinPriceController.getCoinPriceHistory);
router.post('/coin-price/update', coinPriceController.updateCoinPrice);

// Coin bozdurma durumu güncelleme
router.post('/coin-conversion-status', adminController.updateCoinConversionStatus);

export default router; 