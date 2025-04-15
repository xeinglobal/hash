import cron from 'node-cron';
import { distributeStakeDailyProfits, autoCompleteExpiredStakes } from '../controllers/user-stake.controller';
import { checkReferralDeadlines } from '../cron/referral-deadline-check';

// CRON job tanımlamaları
export const initCronJobs = () => {
  console.log('CRON jobs başlatılıyor...');
  
  // Her gece saat 00:15'te referans kazançlarını ve stake kazançlarını dağıt (günlük)
  cron.schedule('15 0 * * *', async () => {
    console.log('Günlük stake ve referans kazançları dağıtım işlemi başlatılıyor...');
    try {
      const result = await distributeStakeDailyProfits();
      console.log('Günlük stake ve referans kazançları dağıtım işlemi tamamlandı:', result);
    } catch (error) {
      console.error('Günlük stake ve referans kazançları dağıtım işlemi sırasında hata oluştu:', error);
    }
  });
  
  // Her gece saat 00:20'de süresi dolan stake işlemlerini otomatik tamamla
  cron.schedule('20 0 * * *', async () => {
    console.log('Süresi dolan stake işlemlerinin otomatik tamamlanması başlatılıyor...');
    try {
      const result = await autoCompleteExpiredStakes();
      console.log('Süresi dolan stake işlemleri tamamlama işlemi tamamlandı:', result);
    } catch (error) {
      console.error('Süresi dolan stake işlemlerini tamamlama işlemi sırasında hata oluştu:', error);
    }
  });
  
  // Her gün saat 9:00'da referans bonusu son tarihlerini kontrol et ve bildirim gönder
  cron.schedule('0 9 * * *', async () => {
    console.log('Referans bonusu son tarih kontrolü başlatılıyor...');
    try {
      await checkReferralDeadlines();
      console.log('Referans bonusu son tarih kontrolü tamamlandı');
    } catch (error) {
      console.error('Referans bonusu son tarih kontrolü sırasında hata oluştu:', error);
    }
  });
  
  console.log('CRON jobs başarıyla başlatıldı.');
}; 