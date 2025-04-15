import mongoose, { Document, Schema } from 'mongoose';

interface IDuration {
  days: number;
  profitRate: number;
}

export interface IStakePackage extends Document {
  name: string;
  priceInCoins: number;
  durations: IDuration[];
  isActive: boolean;
  createdAt: Date;
}

const StakePackageSchema = new Schema<IStakePackage>({
  name: { type: String, required: true },
  priceInCoins: { type: Number, required: true },
  durations: [{
    days: Number,
    profitRate: Number
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const StakePackage = mongoose.model<IStakePackage>('StakePackage', StakePackageSchema); 