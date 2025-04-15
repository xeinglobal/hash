import mongoose, { Document, Schema } from 'mongoose';

export interface ICoinConversionStatus extends Document {
  isActive: boolean;
  lastUpdatedBy: mongoose.Types.ObjectId;
  lastUpdatedAt: Date;
  reason: string;
}

const CoinConversionStatusSchema = new Schema<ICoinConversionStatus>({
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  lastUpdatedAt: { type: Date, default: Date.now },
  reason: { type: String, default: '' }
});

// Sadece tek bir kayıt olması için, statik metod ekleyelim
CoinConversionStatusSchema.statics.getCurrentStatus = async function() {
  const status = await this.findOne().sort({ lastUpdatedAt: -1 });
  return status || null;
};

// Model tipi tanımlaması
interface CoinConversionStatusModel extends mongoose.Model<ICoinConversionStatus> {
  getCurrentStatus(): Promise<ICoinConversionStatus | null>;
}

export const CoinConversionStatus = mongoose.model<ICoinConversionStatus, CoinConversionStatusModel>('CoinConversionStatus', CoinConversionStatusSchema); 