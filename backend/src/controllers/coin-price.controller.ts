import { Request, Response } from 'express';
import { CoinPrice } from '../models/coin-price.model';
import { CoinPriceHistory } from '../models/coin-price-history.model';
import mongoose from 'mongoose';

// Mevcut coin fiyatını getir
export const getCurrentCoinPrice = async (req: Request, res: Response) => {
  try {
    const currentPrice = await CoinPrice.findOne({ isActive: true });
    
    if (!currentPrice) {
      return res.status(404).json({ message: 'Aktif coin fiyatı bulunamadı' });
    }
    
    res.json(currentPrice);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Coin fiyat geçmişini getir
export const getCoinPriceHistory = async (req: Request, res: Response) => {
  try {
    // Limit query parametresi ile son kaç kaydı getireceğimizi belirleyelim
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
    
    const priceHistory = await CoinPriceHistory.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('updatedBy', 'firstName lastName email');
    
    res.json(priceHistory);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Yeni coin fiyatı oluştur (admin için)
export const updateCoinPrice = async (req: Request, res: Response) => {
  try {
    const { pricePerUnit, notes } = req.body;
    console.log('Güncelleme isteği:', { pricePerUnit, notes, user: req.user });
    
    // userId'yi doğru şekilde al (JWT token'da userId olarak saklanıyor)
    const userId = req.user?.userId;
    
    if (!userId) {
      console.log('Kullanıcı kimliği bulunamadı:', req.user);
      return res.status(401).json({ message: 'Kullanıcı kimliği doğrulanamadı' });
    }
    
    // Fiyat validasyonu
    if (!pricePerUnit || pricePerUnit <= 0) {
      return res.status(400).json({ message: 'Geçersiz fiyat' });
    }
    
    console.log('Coin fiyatı güncelleniyor: UserID:', userId, 'Fiyat:', pricePerUnit);
    
    // Önce diğer aktif fiyatları pasif yap
    await CoinPrice.updateMany(
      { isActive: true },
      { isActive: false }
    );
    console.log('Aktif fiyatlar pasif yapıldı');
    
    // Yeni fiyat oluştur ve kaydet
    const newPrice = new CoinPrice({
      pricePerUnit,
      updatedBy: userId,
      updatedAt: new Date(),
      isActive: true
    });
    
    await newPrice.save();
    console.log('Yeni fiyat kaydedildi:', newPrice);
    
    // Fiyat geçmişine ekle
    const priceHistory = new CoinPriceHistory({
      pricePerUnit,
      updatedBy: userId,
      notes: notes || `Fiyat ${pricePerUnit} olarak güncellendi.`
    });
    
    await priceHistory.save();
    console.log('Fiyat geçmişi kaydedildi');
    
    res.status(201).json({
      message: 'Coin fiyatı başarıyla güncellendi',
      currentPrice: newPrice
    });
  } catch (error) {
    console.error('Coin fiyatı güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
}; 