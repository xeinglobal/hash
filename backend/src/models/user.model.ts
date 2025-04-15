import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  trcWallet: string;
  balance: number;
  activeCoin: number;
  passiveCoin: number;
  stakeInvestments: mongoose.Types.ObjectId[];
  referralCode: string;
  referrals: mongoose.Types.ObjectId[];
  referredBy: mongoose.Types.ObjectId;
  referralEarnings: number;
  totalStakeEarnings: number;
  isAdmin: boolean;
  isVerified: boolean;
  hasReferralBonus: boolean;
  currentPackageSize: number;
  referralBonusQualifiedCount: number;
  referralBonusDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  trcWallet: { type: String, unique: true },
  balance: { type: Number, default: 0 },
  activeCoin: { type: Number, default: 0 },
  passiveCoin: { type: Number, default: 0 },
  stakeInvestments: [{ type: Schema.Types.ObjectId, ref: "UserStake" }],
  referralCode: { type: String, unique: true },
  referrals: [{ type: Schema.Types.ObjectId, ref: "User" }],
  referredBy: { type: Schema.Types.ObjectId, ref: "User" },
  referralEarnings: { type: Number, default: 0 },
  totalStakeEarnings: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  hasReferralBonus: { type: Boolean, default: false },
  currentPackageSize: { type: Number, default: 0 },
  referralBonusQualifiedCount: { type: Number, default: 0 },
  referralBonusDeadline: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema); 