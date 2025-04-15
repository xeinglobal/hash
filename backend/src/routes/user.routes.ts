import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, updateProfile } from '../controllers/user.controller';
import { authenticateToken, isAdmin, isOwnerOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Tüm kullanıcıları getir - Sadece admin erişebilir
router.get('/', authenticateToken, isAdmin, getAllUsers);

// Kullanıcı profilini güncelle - Kendi profilini güncelleme
router.put('/update-profile', authenticateToken, updateProfile);

// ID'ye göre kullanıcı getir - Sadece admin veya kendisi erişebilir
router.get('/:id', authenticateToken, isOwnerOrAdmin, getUserById);

// Yeni kullanıcı oluştur - Public (auth/register kullanılabilir bunun yerine)
router.post('/', createUser);

// Kullanıcı güncelle - Sadece admin veya kendisi güncelleyebilir
router.put('/:id', authenticateToken, isOwnerOrAdmin, updateUser);

// Kullanıcı sil - Sadece admin silebilir
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

export  default router ; 