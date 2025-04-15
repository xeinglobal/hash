import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli-anahtar';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log("Token bulunamadı, istek reddedildi");
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log("Token doğrulandı, kullanıcı ID:", decoded.userId);
      
      // Kullanıcı ID ile veritabanından kullanıcıyı kontrol et
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log("Token geçerli ama kullanıcı bulunamadı");
        return res.status(401).json({ message: 'Geçersiz kullanıcı' });
      }
      
      // Kullanıcı bilgilerini isteğe ekle
      req.user = {
        id: decoded.userId,
        userId: decoded.userId, // Geriye dönük uyumluluk için
        isAdmin: user.isAdmin
      };
      
      next();
    } catch (jwtError: any) {
      console.error("Token doğrulama hatası:", jwtError.message);
      
      // JWT hata türlerine göre daha spesifik hata mesajları
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token süresi dolmuş' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Geçersiz token' });
      }
      
      return res.status(401).json({ message: 'Geçersiz token' });
    }
  } catch (error) {
    console.error("Token doğrulama sırasında beklenmeyen hata:", error);
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    
    if (!user?.isAdmin) {
      return res.status(403).json({ message: 'Admin yetkisi gerekli' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Yetkilendirme hatası' });
  }
};

export const isOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId);
    const requestedUserId = req.params.id;
    
    // Kullanıcı admin ise veya kendi hesabına erişiyorsa devam et
    if (user?.isAdmin || userId === requestedUserId) {
      return next();
    }
    
    res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmamaktadır' });
  } catch (error) {
    res.status(500).json({ message: 'Yetkilendirme hatası' });
  }
}; 