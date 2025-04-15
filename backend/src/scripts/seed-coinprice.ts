import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CoinPrice } from '../models/coin-price.model';
import { User } from '../models/user.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hashplatform';

async function seedCoinPrice() {
  try {
    // MongoDB'ye bağlan
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcı bulunması gerekli
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      console.error('Admin kullanıcı bulunamadı. Önce bir admin oluşturun.');
      process.exit(1);
    }

    // Mevcut aktif coin fiyatını kontrol et
    const existingActivePrice = await CoinPrice.findOne({ isActive: true });
    console.log('Mevcut aktif coin fiyatı:', existingActivePrice);

    if (existingActivePrice) {
      console.log('Zaten aktif bir coin fiyatı bulunuyor. İşlem iptal ediliyor.');
      process.exit(0);
    }

    // Yeni coin fiyatı oluştur
    const newCoinPrice = new CoinPrice({
      pricePerUnit: 100, // 1 coin = 100 birim para
      updatedBy: admin._id,
      updatedAt: new Date(),
      isActive: true
    });

    // Kaydet
    await newCoinPrice.save();
    console.log('Coin fiyatı başarıyla oluşturuldu:', newCoinPrice);

    // Bağlantıyı kapat
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Hata:', error);
  }
}

seedCoinPrice(); 