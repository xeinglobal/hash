import { Request, Response } from 'express';
import { CoinConversionStatus } from '../models/coin-conversion-status.model';
import mongoose from 'mongoose';
import { Settings } from '../models/settings.model';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';
import { Deposit } from '../models/deposit.model';
import { Withdrawal } from '../models/withdrawal.model';
import { UserStake } from '../models/user-stake.model';

// Coin bozdurma durumunu güncelle (Admin için)
export const updateCoinConversionStatus = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { isActive, reason } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Kullanıcı kimliği doğrulanamadı' });
    }
    
    // Durum kontrolü
    if (isActive === undefined) {
      return res.status(400).json({ message: 'Durum değeri (isActive) belirtilmelidir' });
    }
    
    // Yeni durum oluştur
    const newStatus = new CoinConversionStatus({
      isActive: !!isActive, // Boolean'a dönüştür
      lastUpdatedBy: userId,
      lastUpdatedAt: new Date(),
      reason: reason || (isActive ? 'Coin bozdurma işlemi aktifleştirildi' : 'Coin bozdurma işlemi devre dışı bırakıldı')
    });
    
    await newStatus.save({ session });
    await session.commitTransaction();
    
    res.json({
      message: `Coin bozdurma işlemi ${isActive ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`,
      status: newStatus
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Sunucu hatası', error });
  } finally {
    session.endSession();
  }
};

// Admin dashboard özet bilgileri getir
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Bekleyen para yatırma/çekme sayıları
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    
    // Toplam kullanıcı sayısı
    const totalUsers = await User.countDocuments();
    
    // Son 24 saatteki işlem sayıları
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentDeposits = await Deposit.countDocuments({ 
      createdAt: { $gte: oneDayAgo } 
    });
    
    const recentWithdrawals = await Withdrawal.countDocuments({ 
      createdAt: { $gte: oneDayAgo } 
    });
    
    // Tüm işlem tutarları
    const depositStats = await Deposit.aggregate([
      { 
        $group: { 
          _id: "$status", 
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        } 
      }
    ]);
    
    const withdrawalStats = await Withdrawal.aggregate([
      { 
        $group: { 
          _id: "$status", 
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        } 
      }
    ]);
    
    return res.status(200).json({
      pendingDeposits,
      pendingWithdrawals,
      totalUsers,
      recentActivity: {
        deposits: recentDeposits,
        withdrawals: recentWithdrawals
      },
      depositStats: depositStats.reduce((acc, curr) => {
        acc[curr._id] = { amount: curr.totalAmount, count: curr.count };
        return acc;
      }, {}),
      withdrawalStats: withdrawalStats.reduce((acc, curr) => {
        acc[curr._id] = { amount: curr.totalAmount, count: curr.count };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Dashboard istatistikleri hatası:', error);
    return res.status(500).json({ message: 'Dashboard istatistikleri alınamadı' });
  }
};

// Sistem ayarlarını getir
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings) {
      return res.status(404).json({ message: 'Sistem ayarları bulunamadı' });
    }
    
    return res.status(200).json(settings);
  } catch (error) {
    console.error('Ayarları getirme hatası:', error);
    return res.status(500).json({ message: 'Sistem ayarları alınamadı' });
  }
};

// Sistem ayarlarını güncelle
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { trc20Wallet, minDeposit, minWithdrawal, referralBonus } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Ayarlar yoksa oluştur
      settings = new Settings({
        trc20Wallet,
        minDeposit,
        minWithdrawal,
        referralBonus
      });
    } else {
      // Varolan ayarları güncelle
      if (trc20Wallet !== undefined) settings.trc20Wallet = trc20Wallet;
      if (minDeposit !== undefined) settings.minDeposit = minDeposit;
      if (minWithdrawal !== undefined) settings.minWithdrawal = minWithdrawal;
      if (referralBonus !== undefined) settings.referralBonus = referralBonus;
      
      settings.updatedAt = new Date();
    }
    
    await settings.save();
    
    return res.status(200).json({ 
      message: 'Sistem ayarları başarıyla güncellendi', 
      settings 
    });
  } catch (error) {
    console.error('Ayarları güncelleme hatası:', error);
    return res.status(500).json({ message: 'Sistem ayarları güncellenemedi' });
  }
};

// Tüm kullanıcıları getir
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    return res.status(500).json({ message: 'Kullanıcılar alınamadı' });
  }
};

// Kullanıcı detaylarını getir
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID formatı' });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı para işlemlerinin toplamlarını hesapla
    const totalDeposits = await Deposit.aggregate([
      { $match: { user: user._id, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWithdrawals = await Withdrawal.aggregate([
      { $match: { user: user._id, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Kullanıcı detaylarını döndür
    const userDetails = {
      ...user.toObject(),
      totalDeposits: totalDeposits.length > 0 ? totalDeposits[0].total : 0,
      totalWithdrawals: totalWithdrawals.length > 0 ? totalWithdrawals[0].total : 0,
      trc20Address: user.trcWallet
    };
    
    return res.status(200).json(userDetails);
  } catch (error) {
    console.error('Kullanıcı detayları hatası:', error);
    return res.status(500).json({ message: 'Kullanıcı detayları alınamadı' });
  }
};

// Kullanıcı işlemlerini getir
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    // Kullanıcıyı bul
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // İşlem tipine göre filtreleme yap
    let query: any = { user: id };
    if (type && type !== 'all') {
      query.type = type;
    }

    // Normal işlemleri getir, ancak para yatırma ve çekme işlemlerini hariç tut
    // Böylece işlemler çift görüntülenmeyecek
    const transactions = await Transaction.find({
      ...query,
      type: { $nin: ['deposit', 'withdrawal'] }
    }).sort({ createdAt: -1 });

    // Stake işlemlerini getir
    const stakes = await UserStake.find({ user: id })
      .populate('stakePackage', 'name priceInCoins')
      .sort({ createdAt: -1 });

    // Stake işlemlerini transaction formatına dönüştür
    const stakeTransactions = stakes.map(stake => ({
      _id: stake._id,
      userId: stake.user.toString(),
      type: 'staking',
      amount: stake.priceInCoins,
      status: stake.isCompleted ? 'completed' : 'pending',
      description: `${(stake.stakePackage as any).name} Stake İşlemi`,
      createdAt: stake.startDate,
      stakeDetails: {
        packageName: (stake.stakePackage as any).name,
        dailyProfit: stake.dailyProfit,
        startDate: stake.startDate,
        endDate: stake.endDate,
        isCompleted: stake.isCompleted
      }
    }));

    // Para yatırma işlemlerini getir
    const deposits = await Deposit.find({ user: id })
      .sort({ createdAt: -1 });

    // Para çekme işlemlerini getir
    const withdrawals = await Withdrawal.find({ user: id })
      .sort({ createdAt: -1 });

    // Para yatırma işlemlerini transaction formatına dönüştür
    const depositTransactions = deposits.map(deposit => ({
      _id: deposit._id,
      userId: deposit.user.toString(),
      type: 'deposit',
      amount: deposit.amount,
      status: deposit.status,
      description: 'Para Yatırma İşlemi',
      createdAt: deposit.createdAt
    }));

    // Para çekme işlemlerini transaction formatına dönüştür
    const withdrawalTransactions = withdrawals.map(withdrawal => ({
      _id: withdrawal._id,
      userId: withdrawal.user.toString(),
      type: 'withdrawal',
      amount: -withdrawal.amount, // Negatif olarak işaretle
      status: withdrawal.status,
      description: 'Para Çekme İşlemi',
      createdAt: withdrawal.createdAt
    }));

    // Referans işlemlerini getir
    const referrals = await User.find({ referredBy: id })
      .select('firstName lastName email currentPackageSize createdAt')
      .sort({ createdAt: -1 });

    // Referansların stake işlemlerini getir
    const referralStakes = await UserStake.find({
      user: { $in: referrals.map(r => r._id) },
      isCompleted: false
    })
      .populate('user', 'firstName lastName email currentPackageSize')
      .populate('stakePackage', 'name priceInCoins')
      .sort({ createdAt: -1 });

    // Referans işlemlerini transaction formatına dönüştür
    const referralTransactions = referrals.map(referral => {
      const referralStake = referralStakes.find(stake => 
        stake.user._id.toString() === (referral._id as mongoose.Types.ObjectId).toString()
      );

      return {
        _id: referral._id as mongoose.Types.ObjectId,
        userId: (referral._id as mongoose.Types.ObjectId).toString(),
        type: 'referral',
        amount: referral.currentPackageSize,
        status: referralStake ? 'active' : 'inactive',
        description: 'Referans İşlemi',
        createdAt: referral.createdAt,
        referralDetails: {
          firstName: referral.firstName,
          lastName: referral.lastName,
          email: referral.email,
          packageSize: referral.currentPackageSize,
          stakeStatus: referralStake ? {
            packageName: (referralStake.stakePackage as any).name,
            dailyProfit: referralStake.dailyProfit,
            startDate: referralStake.startDate,
            endDate: referralStake.endDate
          } : null
        }
      };
    });

    // Tüm işlemleri birleştir ve tarihe göre sırala
    const allTransactions = [
      ...transactions,
      ...stakeTransactions,
      ...depositTransactions,
      ...withdrawalTransactions,
      ...referralTransactions
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      user: {
        _id: user._id,
        username: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      transactions: allTransactions
    });
  } catch (error) {
    console.error('Kullanıcı işlemleri getirilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Kullanıcı doğrulama durumunu değiştir
export const toggleUserVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID formatı' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Doğrulama durumunu tersine çevir
    user.isVerified = !user.isVerified;
    await user.save();
    
    return res.status(200).json({ 
      message: `Kullanıcı ${user.isVerified ? 'doğrulandı' : 'doğrulanmamış olarak işaretlendi'}`,
      isVerified: user.isVerified
    });
  } catch (error) {
    console.error('Kullanıcı doğrulama durumu değiştirme hatası:', error);
    return res.status(500).json({ message: 'Kullanıcı doğrulama durumu değiştirilemedi' });
  }
};

// Admin: Belirli tipteki tüm işlemleri getir
export const getAllTransactionsByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!['deposit', 'withdrawal', 'stake', 'buy_coin', 'sell_coin'].includes(type)) {
      return res.status(400).json({ message: 'Geçersiz işlem tipi' });
    }
    
    const transactions = await Transaction.find({ type })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('İşlemler hatası:', error);
    return res.status(500).json({ message: 'İşlemler alınamadı' });
  }
}; 