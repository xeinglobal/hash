export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  trcWallet: string;
  balance: number;
  activeCoin: number;
  passiveCoin: number;
  stakeInvestments: string[] | UserStake[];
  referralCode: string;
  referrals: string[] | User[];
  referredBy: string | User;
  referralEarnings: number;
  isAdmin: boolean;
  hasReferralBonus: boolean;
  currentPackageSize: number;
  referralBonusQualifiedCount: number;
  referralBonusDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StakePackage {
  _id: string;
  name: string;
  priceInCoins: number;
  durations: {
    days: number;
    profitRate: number;
  }[];
  isActive: boolean;
  createdAt: string;
}

export interface UserStake {
  _id: string;
  user: string | User;
  stakePackage: string | StakePackage;
  priceInCoins: number;
  duration: number;
  profitRate: number;
  totalProfit: number;
  dailyProfit: number;
  lastProfitPaymentDate: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
}

export interface Transaction {
  _id: string;
  user: string | User;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'stake' | 'profit' | 'referral';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Deposit {
  _id: string;
  user: string | User;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  txHash: string;
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  user: string | User;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  txHash: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string | User;
  title: string;
  message: string;
  type: 'referral' | 'stake' | 'bonus' | 'system';
  isRead: boolean;
  createdAt: string;
} 