import { Request, Response } from 'express';
import { UserStake, IUserStake } from '../models/user-stake.model';
import { StakePackage } from '../models/stake-package.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';
import { checkUserReferralBonusEligibility } from './auth.controller';
import { Transaction } from '../models/transaction.model';
import { createNotification } from './notification.controller';

// Tüm stake işlemlerini getir (Admin için)
export const getAllUserStakes = async (req: Request, res: Response) => {
  try {
    const userStakes = await UserStake.find()
      .populate('user', 'firstName lastName email')
      .populate('stakePackage', 'name');
    
    res.json(userStakes);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Kullanıcının kendi stake işlemlerini getir
export const getUserStakes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Kullanıcı kimliği doğrulanamadı' });
    }

    const userStakes = await UserStake.find({ user: userId })
      .populate('stakePackage', 'name priceInCoins durations');
    
    res.json(userStakes);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// ID'ye göre stake detayını getir
export const getUserStakeById = async (req: Request, res: Response) => {
  try {
    const userStake = await UserStake.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('stakePackage', 'name priceInCoins durations');
    
    if (!userStake) {
      return res.status(404).json({ message: 'Stake işlemi bulunamadı' });
    }

    // Kullanıcı yetkisi kontrolü
    const userId = req.user?.userId || req.user?.id;
    const isAdmin = req.user?.isAdmin;
    if (!isAdmin && userId !== userStake.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işleme erişim yetkiniz yok' });
    }
    
    res.json(userStake);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

// Yeni stake işlemi oluştur
export const createUserStake = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Kullanıcı kimliği doğrulanamadı' });
    }

    const { stakePackageId, durationIndex } = req.body;
    
    // Basit validasyon
    if (!stakePackageId || durationIndex === undefined) {
      return res.status(400).json({ message: 'Geçersiz stake işlemi bilgileri' });
    }

    // Stake paketi kontrol
    const stakePackage = await StakePackage.findById(stakePackageId);
    if (!stakePackage || !stakePackage.isActive) {
      return res.status(404).json({ message: 'Stake paketi bulunamadı veya aktif değil' });
    }

    // Süre seçeneği kontrolü
    if (durationIndex < 0 || durationIndex >= stakePackage.durations.length) {
      return res.status(400).json({ message: 'Geçersiz süre seçeneği' });
    }

    const selectedDuration = stakePackage.durations[durationIndex];
    
    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Active Coin bakiye kontrolü
    if (user.activeCoin < stakePackage.priceInCoins) {
      return res.status(400).json({ message: 'Yetersiz coin bakiyesi' });
    }

    // Bitiş tarihini hesapla
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedDuration.days);

    // Toplam kârı hassas bir şekilde hesapla
    const totalProfit = Number((stakePackage.priceInCoins * (selectedDuration.profitRate / 100)).toFixed(8));
    
    // Günlük kârı hassas bir şekilde hesapla
    const dailyProfit = Number((totalProfit / selectedDuration.days).toFixed(8));

    // Stake işlemi oluştur
    const newUserStake = new UserStake({
      user: userId,
      stakePackage: stakePackageId,
      priceInCoins: stakePackage.priceInCoins,
      duration: selectedDuration.days,
      profitRate: selectedDuration.profitRate,
      totalProfit,
      dailyProfit,
      lastProfitPaymentDate: startDate,
      startDate,
      endDate,
      isCompleted: false,
      totalPaidProfit: 0 // Yeni alan: Şimdiye kadar ödenen toplam kar
    });

    // Önce stake işlemini kaydet
    const savedUserStake = await newUserStake.save();
    
    try {
      // Stake başlangıç işlemi için transaction kaydı oluştur
      const stakeTransaction = new Transaction({
        user: userId,
        type: 'stake',
        amount: stakePackage.priceInCoins,
        status: 'approved',
        relatedStake: savedUserStake._id,
        createdAt: startDate
      });
      
      await stakeTransaction.save();
      console.log('Stake işlemi için transaction kaydı oluşturuldu:', stakeTransaction._id);
    } catch (transactionError) {
      console.error('Transaction kaydı oluşturma hatası:', transactionError);
      // Transaction kaydı oluşturma hatası, işlemi durdurmaz, devam ediyoruz
    }
    
    // Kullanıcının ilk stake işlemi mi kontrol et
    const isFirstStake = !user.stakeInvestments || user.stakeInvestments.length === 0;
    
    // Active coin'den düş ve passive coin'e ekle
    const updateData: any = {
      $inc: { 
        activeCoin: -stakePackage.priceInCoins,
        passiveCoin: stakePackage.priceInCoins 
      },
      $push: { stakeInvestments: savedUserStake._id }
    };
    
    // Eğer bu ilk stake işlemiyse ve currentPackageSize henüz ayarlanmamışsa
    // paket büyüklüğünü kullanıcının profil bilgisine kaydet (referans bonusu hesaplaması için)
    if (isFirstStake || user.currentPackageSize === 0) {
      // 30 günlük referans bonusu süresini ayarla
      const bonusDeadline = new Date();
      bonusDeadline.setDate(bonusDeadline.getDate() + 30); // 30 gün ekle
      
      updateData.$set = { 
        currentPackageSize: stakePackage.priceInCoins,
        referralBonusDeadline: bonusDeadline 
      };
      console.log(`Referans bonusu için 30 günlük süre başlatıldı. Son tarih: ${bonusDeadline}`);
    }
    
    // Kullanıcıyı güncelle
    await User.findByIdAndUpdate(userId, updateData);
    
    // Eğer kullanıcı bir referans ile kaydolmuşsa ve bu ilk stake işlemiyse,
    // referans sahibinin bonus uygunluğunu kontrol et
    if ((isFirstStake || user.currentPackageSize === 0) && user.referredBy) {
      try {
        // Referans sahibi için referans bonus kontrolünü başlat
        await checkUserReferralBonusEligibility(user.referredBy as mongoose.Types.ObjectId);
      } catch (error) {
        console.error('Referral bonus kontrolü sırasında hata:', error);
        // Bonus kontrolündeki hata ana işlemi etkilemez, sadece loglama yapılır
      }
    }
    
    // Stake başlangıç bildirimi gönder
    try {
      await createNotification(
        userId,
        'Stake Process Started',
        `Your stake process of ${stakePackage.priceInCoins} coins has been successfully initiated. You will earn ${dailyProfit.toFixed(2)} coins daily for a total of ${selectedDuration.days} days.`,
        'stake'
      );
    } catch (notificationError) {
      console.error('Could not send stake initiation notification:', notificationError);
    }
    
    // Yanıt döndür
    res.status(201).json(savedUserStake);
  } catch (error: any) {
    console.error('Stake işlemi oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Stake işlemini tamamla (Otomatik veya Admin tarafından)
export const completeUserStake = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Stake işlemini bul
    const userStake = await UserStake.findById(id);
    if (!userStake) {
      return res.status(404).json({ message: 'Stake işlemi bulunamadı' });
    }

    // Zaten tamamlanmış mı kontrol et
    if (userStake.isCompleted) {
      return res.status(400).json({ message: 'Bu stake işlemi zaten tamamlanmış' });
    }

    // Kullanıcıyı bul
    const user = await User.findById(userStake.user);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Stake işlemini tamamla
    userStake.isCompleted = true;
    await userStake.save();

    try {
      // Stake tamamlanma işlemi için transaction kaydı oluştur
      const stakeTransaction = new Transaction({
        user: userStake.user,
        type: 'stake_complete',
        amount: userStake.priceInCoins + userStake.totalProfit,
        status: 'completed',
        relatedStake: userStake._id,
        createdAt: new Date()
      });
      
      await stakeTransaction.save();
      console.log('Stake tamamlama için transaction kaydı oluşturuldu:', stakeTransaction._id);
      
      // Stake tamamlanma bildirimi gönder
      await createNotification(
        userStake.user.toString(),
        'Stake Process Completed',
        `Your stake process of ${userStake.priceInCoins} coins has been completed. ${userStake.totalProfit.toFixed(3)} coins profit has been added to your active account.`,
        'stake'
      );
    } catch (transactionError) {
      console.error('Transaction kaydı oluşturma hatası:', transactionError);
      // İşlemi durdurmaz, devam ediyoruz
    }

    // Passive coin'den passive coin'i çıkar ve kullanıcının active coin'ine ana parayı + toplam kazancı aktar
    const totalReturn = userStake.priceInCoins + userStake.totalProfit;
    user.passiveCoin -= userStake.priceInCoins;
    user.activeCoin += totalReturn;
    
    await user.save();
    
    res.json({
      message: 'Stake işlemi başarıyla tamamlandı',
      userStake
    });
  } catch (error: any) {
    console.error('Stake tamamlama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Günlük stake kazançlarını dağıt (CRON job tarafından çağrılacak)
export const distributeStakeDailyProfits = async () => {
  const currentDate = new Date();
  let successCount = 0;
  let failedCount = 0;
  let referralPaymentsCount = 0;

  try {
    console.log('Aktif stake işlemleri aranıyor...');
    // Tüm aktif stake işlemlerini bul
    const activeStakes = await UserStake.find({
      isCompleted: false,
      endDate: { $gt: currentDate }
    }).populate('user');

    console.log(`Bulunan aktif stake sayısı: ${activeStakes.length}`);

    // Her stake işlemi için kazanç hesapla ve dağıt
    for (const stake of activeStakes) {
      try {
        console.log(`\n--- Stake İşlemi (${stake._id}) ---`);
        
        // Kullanıcıyı kontrol et
        const user = await User.findById(stake.user);
        if (!user) {
          console.error(`Kullanıcı bulunamadı: ${stake.user}`);
          failedCount++;
          continue;
        }

        const lastPaymentDate = new Date(stake.lastProfitPaymentDate);
        
        // Gün farkını hassas bir şekilde hesapla
        const daysDifference = (currentDate.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24);
        const fullDays = Math.floor(daysDifference);
        
        console.log(`Son ödeme tarihi: ${lastPaymentDate}`);
        console.log(`Geçen tam gün sayısı: ${fullDays}`);
        console.log(`Günlük kazanç: ${stake.dailyProfit}`);
        console.log(`Toplam ödenmiş kar: ${stake.totalPaidProfit}`);
        console.log(`Hedeflenen toplam kar: ${stake.totalProfit}`);

        if (fullDays >= 1) {
          // Kazancı hassas bir şekilde hesapla
          const stakeEarnings = Number((stake.dailyProfit * fullDays).toFixed(8));
          
          // Toplam ödenmiş karı kontrol et ve güncelle
          const newTotalPaidProfit = Number((stake.totalPaidProfit + stakeEarnings).toFixed(8));
          
          // Eğer toplam ödenmiş kar, hedeflenen toplam kardan fazlaysa düzelt
          let actualEarnings = stakeEarnings;
          if (newTotalPaidProfit > stake.totalProfit) {
            // Kalan kar miktarını hesapla
            actualEarnings = Number((stake.totalProfit - stake.totalPaidProfit).toFixed(8));
            if (actualEarnings <= 0) {
              console.log('Bu stake için maksimum kar miktarına ulaşıldı');
              continue;
            }
            stake.totalPaidProfit = stake.totalProfit;
          } else {
            stake.totalPaidProfit = newTotalPaidProfit;
          }

          // Kullanıcının passive coin'ine ekle
          user.passiveCoin = Number((user.passiveCoin + actualEarnings).toFixed(8));
          
          // Kullanıcının totalStakeEarnings alanını güncelle
          user.totalStakeEarnings = Number((user.totalStakeEarnings + actualEarnings).toFixed(8));
          
          // Stake'in son ödeme tarihini güncelle
          stake.lastProfitPaymentDate = currentDate;
          
          // Değişiklikleri kaydet
          await Promise.all([stake.save(), user.save()]);
          
          console.log(`Bu stake için ödenen kazanç: ${actualEarnings}`);
          successCount++;

          // Kazanç bildirimi gönder
          try {
            await createNotification(
              (user._id as mongoose.Types.ObjectId).toString(),
              'Daily Stake Earnings',
              `Your daily stake earnings of ${actualEarnings.toFixed(8)} coins have been added to your account.`,
              'stake'
            );
          } catch (notificationError) {
            console.error('Could not send stake earnings notification:', notificationError);
          }

          // Referans ödemesi yap
          if (user.referredBy) {
            try {
              const referrer = await User.findById(user.referredBy);
              if (referrer) {
                // Referans kazancını hesapla (%15)
                const referralProfit = Number((actualEarnings * 0.15).toFixed(8));
                
                // Referans kazancını active coin'e ekle
                referrer.activeCoin = Number((referrer.activeCoin + referralProfit).toFixed(8));
                referrer.referralEarnings = Number((referrer.referralEarnings + referralProfit).toFixed(8));
                
                await referrer.save();
                referralPaymentsCount++;
                
                // Referans kazancı bildirimi gönder
                try {
                  await createNotification(
                    (referrer._id as mongoose.Types.ObjectId).toString(),
                    'Referral Earnings',
                    `You have earned ${referralProfit.toFixed(8)} coins as referral commission from the stake earnings of ${user.firstName} ${user.lastName}.`,
                    'referral'
                  );
                } catch (notificationError) {
                  console.error('Could not send referral earnings notification:', notificationError);
                }
              }
            } catch (error) {
              console.error(`Referans ödemesi hatası:`, error);
            }
          }
        } else {
          console.log('Henüz ödeme zamanı gelmedi');
        }
      } catch (error) {
        console.error(`Stake işlemi hatası (${stake._id}):`, error);
        failedCount++;
      }
    }

    return {
      message: 'Günlük stake kazançları dağıtıldı',
      stats: {
        totalStakes: activeStakes.length,
        successCount,
        failedCount,
        referralPaymentsCount
      }
    };
  } catch (error) {
    console.error('Stake kazançları dağıtılırken hata:', error);
    throw error;
  }
};

// Süresi dolan stake'lerin otomatik olarak tamamlanması (CRON job tarafından çağrılacak)
export const autoCompleteExpiredStakes = async () => {
  try {
    const currentDate = new Date();
    
    // Tamamlanmamış ve süresi dolmuş stake işlemlerini bul
    const expiredStakes = await UserStake.find({
      isCompleted: false,
      endDate: { $lte: currentDate }
    });

    if (expiredStakes.length === 0) {
      return { message: 'Süresi dolan stake işlemi bulunamadı', processingDate: currentDate };
    }

    let completedCount = 0;
    let failedCount = 0;

    // Her süresi dolan stake için tamamlama işlemini gerçekleştir
    for (const stake of expiredStakes) {
      try {
        // Kullanıcıyı bul
        const user = await User.findById(stake.user);
        if (!user) {
          failedCount++;
          continue;
        }

        // Stake işlemini tamamla
        stake.isCompleted = true;
        await stake.save();
        
        try {
          // Stake tamamlanma işlemi için transaction kaydı oluştur
          const stakeTransaction = new Transaction({
            user: stake.user,
            type: 'stake_complete',
            amount: stake.priceInCoins + stake.totalProfit,
            status: 'completed',
            relatedStake: stake._id,
            createdAt: new Date()
          });
          
          await stakeTransaction.save();
          console.log('Stake otomatik tamamlama için transaction kaydı oluşturuldu:', stakeTransaction._id);
          
          // Stake tamamlanma bildirimi gönder
          await createNotification(
            stake.user.toString(),
            'Stake Process Completed',
            `Your stake process of ${stake.priceInCoins} coins has been completed. ${stake.totalProfit.toFixed(2)} coins profit has been added to your active account.`,
            'stake'
          );
        } catch (transactionError) {
          console.error('Transaction kaydı oluşturma hatası:', transactionError);
          // İşlemi durdurmaz, devam ediyoruz
        }

        // Passive coin'den ana parayı düş ve active coin'e ana para + toplam kârı aktar
        const totalReturn = stake.priceInCoins + stake.totalProfit;
        user.passiveCoin -= stake.priceInCoins;
        user.activeCoin += totalReturn;
        
        await user.save();
        
        completedCount++;
      } catch (error) {
        failedCount++;
        console.error(`Stake ID ${stake._id} için otomatik tamamlama hatası:`, error);
      }
    }
    
    return {
      message: 'Süresi dolan stake işlemleri otomatik tamamlandı',
      processingDate: currentDate,
      stats: {
        completed: completedCount,
        failed: failedCount
      }
    };
  } catch (error) {
    console.error('Süresi dolan stake işlemlerini tamamlarken hata:', error);
    throw error;
  }
};

// Stake kazanç hesaplamalarını test et
export const testStakeCalculations = async (req: Request, res: Response) => {
  try {
    // Örnek stake verileri
    const testData = {
      priceInCoins: 1000, // 1000 coin yatırım
      profitRate: 1.5,    // %1.5 günlük kazanç
      duration: 30,       // 30 günlük stake
    };

    // Toplam kar hesaplama
    const totalProfit = Number((testData.priceInCoins * (testData.profitRate / 100) * testData.duration).toFixed(8));
    
    // Günlük kar hesaplama
    const dailyProfit = Number((totalProfit / testData.duration).toFixed(8));

    // 30 günlük simülasyon yap
    const simulationResults = [];
    let totalPaidProfit = 0;
    const startDate = new Date();

    for (let day = 1; day <= testData.duration; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      // Günlük kazancı hesapla
      const dayEarnings = Number(dailyProfit.toFixed(8));
      totalPaidProfit = Number((totalPaidProfit + dayEarnings).toFixed(8));

      // Eğer toplam ödenen kar, hedeflenen karı aşıyorsa düzelt
      let actualEarnings = dayEarnings;
      if (totalPaidProfit > totalProfit) {
        actualEarnings = Number((totalProfit - (totalPaidProfit - dayEarnings)).toFixed(8));
        totalPaidProfit = totalProfit;
      }

      simulationResults.push({
        day,
        date: currentDate,
        dailyProfit: dayEarnings,
        actualEarnings,
        totalPaidSoFar: totalPaidProfit,
        percentageOfTotal: Number(((totalPaidProfit / totalProfit) * 100).toFixed(2))
      });
    }

    // Referans kazançlarını hesapla
    const referralResults = simulationResults.map(day => ({
      day: day.day,
      referralProfit: Number((day.actualEarnings * 0.15).toFixed(8)), // %15 referans kazancı
    }));

    // Sonuçları döndür
    res.json({
      input: testData,
      calculations: {
        totalInvestment: testData.priceInCoins,
        profitPerDay: `${testData.profitRate}%`,
        duration: `${testData.duration} gün`,
        expectedTotalProfit: totalProfit,
        expectedDailyProfit: dailyProfit,
        expectedTotalReturn: Number((testData.priceInCoins + totalProfit).toFixed(8))
      },
      dailySimulation: simulationResults,
      referralSimulation: {
        dailyReferralProfits: referralResults,
        totalReferralProfit: Number((referralResults.reduce((sum, day) => sum + day.referralProfit, 0)).toFixed(8))
      },
      summary: {
        totalPaidProfit,
        profitAccuracy: Number(((totalPaidProfit / totalProfit) * 100).toFixed(2)) + '%',
        isExactMatch: totalPaidProfit === totalProfit
      }
    });

  } catch (error) {
    console.error('Stake hesaplama testi hatası:', error);
    res.status(500).json({ message: 'Test sırasında hata oluştu', error });
  }
};

