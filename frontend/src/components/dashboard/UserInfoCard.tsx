import React from 'react';
import { User } from '@/types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

interface UserInfoCardProps {
  user: User;
  onDeposit: () => void;
  onWithdraw: () => void;
  onBuyCoin: () => void;
  onSellCoin: () => void;
}

// Function to determine package name based on package size
const getPackageName = (packageSize: number): string => {
  if (packageSize <= 0) return "No Package";
  if (packageSize <= 500) return "Hash Bronze";
  if (packageSize <= 1000) return "Hash Silver";
  if (packageSize <= 2500) return "Hash Gold";
  if (packageSize <= 5000) return "Hash Platinum";
  return "Hash Diamond";
};

// Function to calculate remaining days
const calculateRemainingDays = (deadlineDate: string | Date | undefined): number => {
  if (!deadlineDate) return 0;
  
  const deadline = typeof deadlineDate === 'string' ? new Date(deadlineDate) : deadlineDate;
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user,
  onDeposit,
  onWithdraw,
  onBuyCoin,
  onSellCoin
}) => {
  // Calculate qualified referrals for referral bonus
  const qualifiedReferrals = Array.isArray(user.referrals) 
    ? user.referrals.filter((ref: any) => ref.currentPackageSize >= user.currentPackageSize).length 
    : 0;
    
  // Use qualified referrals count directly from API data
  const qualifiedReferralsCount = user.referralBonusQualifiedCount || qualifiedReferrals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10 opacity-5 overflow-hidden rounded-lg">
        <Image 
          src="/images/background.jpg" 
          alt="Background" 
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
          priority
        />
      </div>
      
      {/* Balance Card */}
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Balance</h3>
          <CurrencyDollarIcon className="h-6 w-6 text-teal-500" />
        </div>
        <p className="text-2xl font-bold text-white">{(user.balance || 0).toFixed(2)} $</p>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={onDeposit}
            className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-md text-sm hover:from-green-700 hover:to-teal-700 transition w-1/2"
          >
            <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
            Deposit
          </button>
          <button
            onClick={onWithdraw}
            className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-md text-sm hover:from-red-700 hover:to-red-900 transition w-1/2"
          >
            <ArrowDownCircleIcon className="h-4 w-4 mr-1" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Active Coin Card */}
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Active Coins</h3>
          <ChartBarIcon className="h-6 w-6 text-teal-500" />
        </div>
        <p className="text-2xl font-bold text-white">{(user.activeCoin || 0).toFixed(8)}</p>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={onBuyCoin}
            className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-md text-sm hover:from-blue-700 hover:to-teal-700 transition w-1/2"
          >
            Buy Coins
          </button>
          <button
            onClick={onSellCoin}
            className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-md text-sm hover:from-gray-700 hover:to-gray-900 transition w-1/2"
          >
            Sell Coins
          </button>
        </div>
      </div>

      {/* Passive Coin Card */}
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Passive Coins</h3>
          <ChartBarIcon className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-2xl font-bold text-white">{(user.passiveCoin || 0).toFixed(8)}</p>
        <p className="text-xs text-gray-300 mt-2 mb-4">Coins used in staking operations</p>
        
        <div className="flex space-x-2">
          <Link href="/stake-packages" className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-md text-sm hover:from-teal-700 hover:to-blue-700 transition w-1/2">
            Stake Packages
          </Link>
          <Link href="/dashboard/my-stakes" className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-md text-sm hover:from-purple-700 hover:to-purple-900 transition w-1/2">
            My Stakes
          </Link>
        </div>
        
        <div className="mt-4 pt-2 border-t border-gray-700">
          <p className="text-sm text-gray-300">
            <span className="font-medium">Note:</span> Passive coins are used in staking operations and convert to active coins when the staking period ends.
          </p>
        </div>
      </div>

      {/* Referral Bonus Card - The area marked with a red box in the photo */}
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-md p-6 md:col-span-3 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Referral Bonus</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
            {user.hasReferralBonus ? 'Earned' : 'Active'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Package Information */}
          <div className="border-r border-gray-700 pr-4">
            <h4 className="text-sm font-medium text-gray-300">Your Current Package</h4>
            <p className="mt-1 text-lg font-semibold text-teal-400">
              {(user.currentPackageSize || 0) > 0 
                ? `${getPackageName(user.currentPackageSize || 0)} (${(user.currentPackageSize || 0)} Coins)` 
                : "No Package"}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {user.hasReferralBonus 
                ? "Bonus earned: " + (user.currentPackageSize || 0) + " Coins" 
                : "You will receive " + (user.currentPackageSize || 0) + " Coins when you earn the bonus"}
            </p>
          </div>
          
          {/* Referral Status Information */}
          <div className="border-r border-gray-700 px-4">
            <h4 className="text-sm font-medium text-gray-300">Referral Status</h4>
            <div className="mt-1 flex items-center">
              <span className={`text-xl font-bold ${
                qualifiedReferralsCount >= 5 ? 'text-green-400' : 'text-teal-400'
              }`}>
                {qualifiedReferralsCount}/5
              </span>
              <span className="ml-2 text-sm text-gray-300">
                {qualifiedReferralsCount >= 5 
                  ? 'You have reached the required number of referrals!' 
                  : `${5 - qualifiedReferralsCount} more referrals needed`}
              </span>
            </div>
            
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-teal-500 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, (qualifiedReferralsCount / 5) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Time Information */}
          <div className="pl-4">
            <h4 className="text-sm font-medium text-gray-300">Remaining Time</h4>
            {!user.hasReferralBonus && user.referralBonusDeadline ? (
              <>
                <p className="mt-1 text-xl font-bold text-red-400">
                  {calculateRemainingDays(user.referralBonusDeadline)} days
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  Your deadline to earn the referral bonus: {new Date(user.referralBonusDeadline).toLocaleDateString()}
                </p>
              </>
            ) : user.hasReferralBonus ? (
              <p className="mt-1 text-lg font-semibold text-green-400">
                Congratulations! You have earned your referral bonus.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-300">
                Your 30-day period will start when you make your first stake.
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-300">
              <span className="font-medium">Total Referral Earnings:</span> {(user.referralEarnings || 0).toFixed(8)} Coins
            </p>
            <Link href="/profile" className="text-sm text-teal-400 hover:text-teal-300">
              View All My Referrals →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard; 