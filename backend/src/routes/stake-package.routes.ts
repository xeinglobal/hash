import { Router } from 'express';
import { getAllStakePackages, getStakePackageById, createStakePackage, updateStakePackage, deleteStakePackage } from '../controllers/stake-package.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Tüm stake paketlerini getir - Herkes erişebilir
router.get('/', getAllStakePackages);

// ID'ye göre stake paketi getir
router.get('/:id', getStakePackageById);

// Yeni stake paketi oluştur - Sadece admin oluşturabilir
router.post('/', authenticateToken, isAdmin, createStakePackage);

// Stake paketini güncelle - Sadece admin güncelleyebilir
router.put('/:id', authenticateToken, isAdmin, updateStakePackage);

// Stake paketini sil - Sadece admin silebilir
router.delete('/:id', authenticateToken, isAdmin, deleteStakePackage);

export default router; 