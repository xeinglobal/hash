import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawal extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  trcWallet: string;
  status: 'pending' | 'approved' | 'rejected';
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  trcWallet: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Withdrawal = mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema); 