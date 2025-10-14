import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli-anahtar';

// JWT_SECRET değerini kontrol amaçlı loglama (güvenli ortamlarda silersiniz)
console.log("Kullanılan JWT_SECRET:", JWT_SECRET.substring(0, 3) + '...');

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
    
    // OPTIONS isteklerini her zaman kabul et (CORS için)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log("Token bulunamadı, istek reddedildi");
      return res.status(401).json({ 
        message: 'Token bulunamadı',
        error: 'auth/missing-token',
        logout: true
      });
    }

    try {
      console.log("Token doğrulanıyor... Token başlangıcı:", token.substring(0, 10) + '...');
      console.log("Kullanılan JWT_SECRET başlangıcı:", JWT_SECRET.substring(0, 3) + '...');
      
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log("Token doğrulandı, kullanıcı ID:", decoded.userId);
      
      // Kullanıcı ID ile veritabanından kullanıcıyı kontrol et
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log("Token geçerli ama kullanıcı bulunamadı");
        return res.status(401).json({ 
          message: 'Geçersiz kullanıcı',
          error: 'auth/invalid-user',
          logout: true
        });
      }
      
      // Kullanıcı bilgilerini isteğe ekle
      req.user = {
        id: decoded.userId,
        userId: decoded.userId, // Geriye dönük uyumluluk için
        isAdmin: user.isAdmin
      };
      
      next();
    } catch (jwtError: any) {
      console.error("Token doğrulama hatası:", jwtError.name, jwtError.message);
      
      // JWT hata türlerine göre daha spesifik hata mesajları
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token süresi dolmuş', 
          error: 'auth/token-expired',
          logout: true
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Geçersiz token',
          error: 'auth/invalid-token',
          logout: true
        });
      }
      
      return res.status(401).json({ 
        message: 'Geçersiz token',
        error: 'auth/token-verification-failed',
        logout: true
      });
    }
  } catch (error) {
    console.error("Token doğrulama sırasında beklenmeyen hata:", error);
    res.status(401).json({ 
      message: 'Geçersiz token',
      error: 'auth/unknown-error',
      logout: true
    });
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