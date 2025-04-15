import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'stake' | 'stake_start' | 'stake_complete' | 'buy_coin' | 'sell_coin';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  transactionHash?: string;
  relatedStake?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { 
    type: String, 
    enum: ["deposit", "withdrawal", "stake", "stake_start", "stake_complete", "buy_coin", "sell_coin"], 
    required: true 
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "completed"], 
    default: "pending" 
  },
  transactionHash: String,
  relatedStake: { type: Schema.Types.ObjectId, ref: "UserStake" },
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema); 