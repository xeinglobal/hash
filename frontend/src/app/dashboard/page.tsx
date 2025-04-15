'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import UserInfoCard from '@/components/dashboard/UserInfoCard';
import CoinPriceChart from '@/components/dashboard/CoinPriceChart';
import DepositModal from '@/components/dashboard/DepositModal';
import WithdrawalModal from '@/components/dashboard/WithdrawalModal';
import BuyCoinModal from '@/components/dashboard/BuyCoinModal';
import SellCoinModal from '@/components/dashboard/SellCoinModal';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import { getCurrentCoinPrice } from '@/services/coinService';
import api from '@/services/api';

// Type definitions for API response
interface ReferralBonus {
  hasReceived: boolean;
  currentPackageSize: number;
  qualifiedReferrals: number;
  remainingReferralsNeeded: number;
  potentialBonus: number;
}

interface ReferralInfo {
  referralCode: string;
  referralUrl: string;
  referralCount: number;
  totalReferralEarnings: number;
  referralBonus: ReferralBonus;
  referrals: Array<any>;
  qualifiedReferrals: Array<any>;
  referredBy: any;
}

export default function Dashboard() {
  const { user, refreshUserData } = useAuth();
  const searchParams = useSearchParams();
  
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isBuyCoinModalOpen, setIsBuyCoinModalOpen] = useState(false);
  const [isSellCoinModalOpen, setIsSellCoinModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);

  useEffect(() => {
    const initPage = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Load price data and referral information in parallel
          const [priceData, referralData] = await Promise.all([
            fetchData(),
            fetchReferralInfo()
          ]);
          
          if (referralData) {
            setReferralInfo(referralData);
            console.log("Referral information loaded successfully:", referralData);
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
        
        const shouldOpenDeposit = searchParams.get('isDeposit') === 'true';
        if (shouldOpenDeposit) {
          setIsDepositModalOpen(true);
        }
      } else {
        setIsLoading(false);
      }
    };

    initPage();
  }, [user, searchParams]);

  const fetchData = async () => {
    try {
      const priceData = await getCurrentCoinPrice();
      setCurrentPrice(priceData.pricePerUnit);
      return priceData;
    } catch (error) {
      console.error('Could not get price data:', error);
      return null;
    }
  };
  
  const fetchReferralInfo = async () => {
    try {
      if (!user) return null;
      
      const response = await api.get('/referrals/info');
      console.log("Referral API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Could not get referral information:', error);
      return null;
    }
  };

  const handleSuccess = async () => {
    setIsLoading(true);
    try {
      await refreshUserData();
      await fetchData();
      // Also refresh referral information when transaction is successful
      const newReferralInfo = await fetchReferralInfo();
      if (newReferralInfo) {
        setReferralInfo(newReferralInfo);
      }
    } catch (error) {
      console.error('Error updating data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine referral information and user object
  const enhancedUser = user && referralInfo ? {
    ...user,
    referrals: referralInfo.referrals || user.referrals,
    qualifiedReferrals: referralInfo.qualifiedReferrals || [],
    referralBonusQualifiedCount: referralInfo.referralBonus?.qualifiedReferrals || 0,
    hasReferralBonus: referralInfo.referralBonus?.hasReceived !== undefined ? 
      referralInfo.referralBonus.hasReceived : 
      user.hasReferralBonus
  } : user;

  if (!enhancedUser) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          {/* Balance and Coin Information */}
          <div className="mb-8">
            <UserInfoCard 
              user={enhancedUser}
              onDeposit={() => setIsDepositModalOpen(true)}
              onWithdraw={() => setIsWithdrawalModalOpen(true)}
              onBuyCoin={() => setIsBuyCoinModalOpen(true)}
              onSellCoin={() => setIsSellCoinModalOpen(true)}
            />
          </div>
          
          {/* Coin Price Chart */}
          <div className="mb-8 bg-gray-900/50 backdrop-blur-md p-4 rounded-xl border border-gray-800">
            <CoinPriceChart />
          </div>
          
          {/* Transaction History */}
          <div className="mb-8 bg-gray-900/50 backdrop-blur-md p-4 rounded-xl border border-gray-800">
            <TransactionHistory />
          </div>
        </>
      )}
      
      {/* Modals */}
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
      
      <WithdrawalModal 
        isOpen={isWithdrawalModalOpen} 
        onClose={() => setIsWithdrawalModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
      
      <BuyCoinModal 
        isOpen={isBuyCoinModalOpen} 
        onClose={() => setIsBuyCoinModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
      
      <SellCoinModal 
        isOpen={isSellCoinModalOpen} 
        onClose={() => setIsSellCoinModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
} 