import mongoose, { Document, Schema } from 'mongoose';

export interface IDeposit extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  trcWallet: string;
  status: 'pending' | 'approved' | 'rejected';
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema = new Schema<IDeposit>({
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

export const Deposit = mongoose.model<IDeposit>('Deposit', DepositSchema); 