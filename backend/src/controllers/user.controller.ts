import { Request, Response } from 'express';
import { User } from '../models/user.model';

// Tüm kullanıcıları getir
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// ID'ye göre kullanıcı getir
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Yeni kullanıcı oluştur
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, trcWallet, referralCode } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gereklidir' });
    }
    
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      trcWallet,
      referralCode
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Kullanıcı güncelle
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Kullanıcı sil
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Kullanıcı kendi profilini günceller
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; // JWT token'ından kullanıcı ID'si
    
    if (!userId) {
      return res.status(401).json({ message: 'Oturum açmanız gerekiyor' });
    }
    
    // Güncellenebilecek alanları belirleme
    const { firstName, lastName, trcWallet } = req.body;
    
    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(trcWallet && { trcWallet }),
      updatedAt: new Date()
    };
    
    // Kullanıcıyı güncelle
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password'); // Cevaptan şifreyi hariç tut
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profil güncellenirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: (error as Error).message });
  }
}; 