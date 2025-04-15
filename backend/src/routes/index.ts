import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import stakePackageRoutes from './stake-package.routes';
import userStakeRoutes from './user-stake.routes';
import coinRoutes from './coin.routes';
import coinPriceRoutes from './coin-price.routes';
import adminRoutes from './admin.routes';
import depositRoutes from './deposit.routes';
import withdrawalRoutes from './withdrawal.routes';
import transactionRoutes from './transaction.routes';
import referralRoutes from './referral.routes';
import notificationRoutes from './notification.routes';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Genel erişim için ayarlar endpoint'i
router.get('/settings', adminController.getSettings);

// Alt rotalar
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/stake-packages', stakePackageRoutes);
router.use('/user-stakes', userStakeRoutes);
router.use('/coins', coinRoutes);
router.use('/coin-prices', coinPriceRoutes);
router.use('/admin', adminRoutes);
router.use('/deposits', depositRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/transactions', transactionRoutes);
router.use('/referrals', referralRoutes);
router.use('/notifications', notificationRoutes);

export default router; 