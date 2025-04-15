import mongoose, { Document, Schema } from 'mongoose';

export interface IUserStake extends Document {
  user: mongoose.Types.ObjectId;
  stakePackage: mongoose.Types.ObjectId;
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

const UserStakeSchema = new Schema<IUserStake>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  stakePackage: { type: Schema.Types.ObjectId, ref: "StakePackage", required: true },
  priceInCoins: { type: Number, required: true },
  duration: { type: Number, required: true },
  profitRate: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  dailyProfit: { type: Number, required: true },
  lastProfitPaymentDate: { type: Date, default: Date.now },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
  totalPaidProfit: { type: Number, default: 0 }
});

export const UserStake = mongoose.model<IUserStake>('UserStake', UserStakeSchema); 