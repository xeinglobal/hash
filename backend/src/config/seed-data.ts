import { User } from '../models/user.model';
import { CoinPrice } from '../models/coin-price.model';
import { CoinPriceHistory } from '../models/coin-price-history.model';
import { CoinConversionStatus } from '../models/coin-conversion-status.model';
import { Settings } from '../models/settings.model';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const seedData = async () => {
  try {
    console.log('Veritabanı başlangıç verilerini kontrol ediliyor...');
    
    // Admin kullanıcı kontrolü ve oluşturma
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('Admin kullanıcısı oluşturuluyor...');
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        trcWallet: 'ADMIN_WALLET',
        referralCode: 'ADMIN',
        isAdmin: true
      });
      
      console.log('Admin kullanıcısı oluşturuldu:', adminUser.email);
    }
    
    // Aktif coin fiyatı kontrolü ve oluşturma
    const activeCoinPrice = await CoinPrice.findOne({ isActive: true });
    
    if (!activeCoinPrice) {
      console.log('Başlangıç coin fiyatı oluşturuluyor...');
      
      const initialPrice = 0.2; // 
      
      const newCoinPrice = await CoinPrice.create({
        pricePerUnit: initialPrice,
        updatedBy: adminUser._id,
        updatedAt: new Date(),
        isActive: true
      });
      
      // İlk fiyat geçmişi kaydı
      await CoinPriceHistory.create({
        pricePerUnit: initialPrice,
        updatedBy: adminUser._id,
        notes: 'Sistem başlangıç fiyatı'
      });
      
      console.log('Başlangıç coin fiyatı oluşturuldu:', newCoinPrice.pricePerUnit);
    }
    
    // Coin bozdurma durumu kontrolü ve oluşturma
    const conversionStatus = await CoinConversionStatus.getCurrentStatus();
    
    if (!conversionStatus) {
      console.log('Başlangıç coin bozdurma durumu oluşturuluyor...');
      
      // Varsayılan olarak bozdurma aktif
      const initialStatus = await CoinConversionStatus.create({
        isActive: true, // Başlangıçta aktif olsun
        lastUpdatedBy: adminUser._id,
        lastUpdatedAt: new Date(),
        reason: 'Sistem başlangıç durumu'
      });
      
      console.log('Başlangıç coin bozdurma durumu oluşturuldu:', initialStatus.isActive ? 'Aktif' : 'Pasif');
    }
    
    // Sistem ayarları kontrolü ve oluşturma
    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('Sistem ayarları oluşturuluyor...');
      
      const initialSettings = await Settings.create({
        trc20Wallet: 'TRC20EXAMPLEWALLET12345678900987654321',
        minDeposit: 10,
        minWithdrawal: 20,
        referralBonus: 15
      });
      
      console.log('Sistem ayarları oluşturuldu. TRC20 Wallet:', initialSettings.trc20Wallet);
    }
    
    console.log('Veritabanı başlangıç verileri kontrol edildi.');
  } catch (error) {
    console.error('Seed data hatası:', error);
    throw error;
  }
}; 