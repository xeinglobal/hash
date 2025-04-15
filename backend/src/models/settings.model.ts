import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  trc20Wallet: string;
  minDeposit: number;
  minWithdrawal: number;
  referralBonus: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  trc20Wallet: { type: String, required: true },
  minDeposit: { type: Number, default: 10 },
  minWithdrawal: { type: Number, default: 10 },
  referralBonus: { type: Number, default: 15 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema); 