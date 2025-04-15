import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { UserStake } from '../models/user-stake.model';

// Kullanıcının kendi referral bilgilerini getir
export const getUserReferralInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Kullanıcı kimliği doğrulanamadı' });
    }

    const user = await User.findById(userId)
      .select('referralCode referrals referralEarnings referredBy hasReferralBonus referralBonusQualifiedCount currentPackageSize')
      .populate('referrals', 'firstName lastName email currentPackageSize createdAt')
      .populate('referredBy', 'firstName lastName email referralCode');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Referral bonusu için gerekli daha kaç referans olduğunu hesapla
    const remainingReferralsForBonus = user.hasReferralBonus ? 0 : (5 - user.referralBonusQualifiedCount);

    // Kendi referrallarımdan toplam kazancımı hesapla
    const totalEarnedFromReferrals = user.referralEarnings;

    // Referral bonusu koşulunu sağlayan referralların listesini hazırla
    const qualifiedReferrals = await User.find({
      referredBy: user._id,
      currentPackageSize: { $gte: user.currentPackageSize }
    }).select('firstName lastName email currentPackageSize createdAt');

    // Sonuçta tüm referral bilgilerini içeren bir obje döndür
    res.json({
      referralCode: user.referralCode,
      referralUrl: `${process.env.FRONTEND_URL || 'https://yourwebsite.com'}/register?referral=${user.referralCode}`,
      referralCount: user.referrals.length,
      totalReferralEarnings: totalEarnedFromReferrals,
      referralBonus: {
        hasReceived: user.hasReferralBonus,
        currentPackageSize: user.currentPackageSize,
        qualifiedReferrals: qualifiedReferrals.length,
        remainingReferralsNeeded: remainingReferralsForBonus,
        potentialBonus: user.hasReferralBonus ? 0 : user.currentPackageSize
      },
      referrals: user.referrals,
      qualifiedReferrals,
      referredBy: user.referredBy
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Kullanıcının referanslarının stake durumlarını getir
export const getReferralStakes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Kullanıcı kimliği doğrulanamadı' });
    }

    // Kullanıcının referanslarını bul
    const user = await User.findById(userId).select('referrals');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Referansların aktif stake işlemlerini bul
    const referralStakes = await UserStake.find({
      user: { $in: user.referrals },
      isCompleted: false
    })
      .populate('user', 'firstName lastName email')
      .populate('stakePackage', 'name priceInCoins')
      .select('user stakePackage dailyProfit startDate endDate');

    // Referans bazında gruplama yap
    interface ReferralStakeUser {
      user: any;
      stakes: any[];
      totalDailyProfit: number;
      estimatedDailyEarning: number;
    }

    const referralStakesByUser: Record<string, ReferralStakeUser> = {};
    
    for (const stake of referralStakes) {
      const userId = stake.user._id.toString();
      
      if (!referralStakesByUser[userId]) {
        referralStakesByUser[userId] = {
          user: stake.user,
          stakes: [],
          totalDailyProfit: 0,
          estimatedDailyEarning: 0
        };
      }
      
      referralStakesByUser[userId].stakes.push(stake);
      referralStakesByUser[userId].totalDailyProfit += stake.dailyProfit;
      referralStakesByUser[userId].estimatedDailyEarning += stake.dailyProfit * 0.15; // %15 referans kazancı
    }

    res.json({
      totalReferrals: user.referrals.length,
      activeReferralsWithStakes: Object.keys(referralStakesByUser).length,
      referralStakes: Object.values(referralStakesByUser)
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Tüm referans sistemi istatistiklerini getir (Admin için)
export const getReferralSystemStats = async (req: Request, res: Response) => {
  try {
    // Admin kontrolü
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
    }

    // Toplam referral kazançlarını hesapla
    const totalReferralStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalReferralEarnings: { $sum: '$referralEarnings' },
          usersWithReferrer: { $sum: { $cond: [{ $ifNull: ['$referredBy', false] }, 1, 0] } },
          usersWithReferrals: { $sum: { $cond: [{ $gt: [{ $size: '$referrals' }, 0] }, 1, 0] } },
          usersBonusReceived: { $sum: { $cond: ['$hasReferralBonus', 1, 0] } }
        }
      }
    ]);

    // En çok referans yapan 10 kullanıcıyı bul
    const topReferrers = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          referralCount: { $size: '$referrals' },
          referralEarnings: 1
        }
      },
      { $sort: { referralCount: -1 } },
      { $limit: 10 }
    ]);

    // En çok referans kazancı elde eden 10 kullanıcıyı bul
    const topEarners = await User.aggregate([
      {
        $match: { referralEarnings: { $gt: 0 } }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          referralCount: { $size: '$referrals' },
          referralEarnings: 1
        }
      },
      { $sort: { referralEarnings: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      stats: totalReferralStats[0] || {
        totalUsers: 0,
        totalReferralEarnings: 0,
        usersWithReferrer: 0,
        usersWithReferrals: 0,
        usersBonusReceived: 0
      },
      topReferrers,
      topEarners
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
}; 