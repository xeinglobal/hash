export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  activeCoin: number;
  passiveCoin: number;
  referralCode: string;
  referralEarnings: number;
  totalStakeEarnings: number;
  currentPackageSize: number;
  referralBonusQualifiedCount: number;
  referralBonusDeadline: Date | null;
  hasReferralBonus: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  trcWallet?: string;
  createdAt: Date | string;
  referrals: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    currentPackageSize: number;
    createdAt: Date;
  }>;
}

export interface Notification {
  _id: string;
  user: string | User;
  title: string;
  message: string;
  type: string; // 'referral' | 'stake' | 'bonus' | 'system'
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StakePackage {
  _id: string;
  name: string;
  priceInCoins: number;
  description?: string;
  durations: Array<{
    days: number;
    profitRate: number;
  }>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStake {
  _id: string;
  user: string | User;
  stakePackage: string | {
    _id: string;
    name: string;
    priceInCoins: number;
    durations: Array<{
      days: number;
      profitRate: number;
    }>;
  };
  priceInCoins: number;
  duration: number;
  profitRate: number;
  totalProfit: number;
  dailyProfit: number;
  lastProfitPaymentDate: Date;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  totalPaidProfit: number;
} 