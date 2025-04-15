import { Settings } from '../models/settings.model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

// MongoDB bağlantı bilgisi
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hash-app';

// Settings veri eklemesi için ana fonksiyon
const seedSettings = async () => {
  try {
    // MongoDB'ye bağlan
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB\'ye başarıyla bağlandı!');
    
    // Mevcut settings kontrolü
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      console.log('Sistem ayarları zaten mevcut:', existingSettings);
    } else {
      console.log('Sistem ayarları oluşturuluyor...');
      
      // Yeni settings oluştur
      const settings = new Settings({
        trc20Wallet: 'TRC20EXAMPLEWALLET12345678900987654321',
        minDeposit: 10,
        minWithdrawal: 20,
        referralBonus: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Kaydet
      await settings.save();
      console.log('Sistem ayarları başarıyla oluşturuldu!', settings);
    }
    
    // Bağlantıyı kapat
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı.');
    
  } catch (error) {
    console.error('Hata:', error);
  }
};

// Fonksiyonu çalıştır
seedSettings()
  .then(() => console.log('İşlem tamamlandı.'))
  .catch(err => console.error('Seed işlemi başarısız oldu:', err)); 