
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import { Transaction } from '../models/transaction.model';

// dotenv.config();

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hash';

// async function testTransactionEndpoint() {
//   try {
//     // MongoDB'ye bağlan
//     console.log('MongoDB\'ye bağlanılıyor...');
//     await mongoose.connect(MONGODB_URI);
//     console.log('MongoDB bağlantısı başarılı');

//     // Veritabanındaki işlemleri doğrudan sorgula
//     const transactions = await Transaction.find().sort({ createdAt: -1 });
//     console.log('Veritabanındaki işlemler:');
//     console.log(JSON.stringify(transactions, null, 2));
//     console.log(`Toplam işlem sayısı: ${transactions.length}`);

//     // Bağlantıyı kapat
//     await mongoose.disconnect();
//     console.log('MongoDB bağlantısı kapatıldı');
//   } catch (error) {
//     console.error('Hata:', error);
//   }
// }

// testTransactionEndpoint(); 