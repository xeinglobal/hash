import { User } from '../models/user.model';
import { createNotification } from '../controllers/notification.controller';

// Referans bonusu için kalan süreyi kontrol eden ve gerektiğinde bildirim gönderen CRON işi
export const checkReferralDeadlines = async () => {
  try {
    console.log('Referral deadline kontrolü başlatıldı');
    
    const currentDate = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    // Referans bonusu almamış, son tarihi mevcut ve bu tarih 7 gün içinde olan kullanıcıları bul
    const users = await User.find({
      hasReferralBonus: false,
      referralBonusDeadline: { 
        $exists: true, 
        $ne: null,
        $lte: sevenDaysLater,
        $gt: currentDate
      }
    });
    
    console.log(`Referans bonusu için son 7 günü kalan ${users.length} kullanıcı bulundu`);
    
    // Her kullanıcıya bildirim gönder
    for (const user of users) {
      const deadline = new Date(user.referralBonusDeadline);
      const daysLeft = Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Bildirim gönder
      await createNotification(
        user._id as unknown as string,
        'Referans Bonusu Hatırlatması',
        `Referans bonusunuzdan faydalanmak için sadece ${daysLeft} gün kaldı! 5 arkadaşınızı davet etmeyi unutmayın.`,
        'bonus'
      );
      
      console.log(`Kullanıcı ${user._id} için referans bonusu hatırlatması gönderildi. Kalan gün: ${daysLeft}`);
    }
    
    console.log('Referral deadline kontrolü tamamlandı');
  } catch (error) {
    console.error('Referral deadline kontrolü sırasında hata:', error);
  }
}; 