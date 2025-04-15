import mongoose, { Document, Schema } from 'mongoose';

export interface ICoinPriceHistory extends Document {
  pricePerUnit: number; // Kayıt zamanındaki birim fiyat
  updatedBy: mongoose.Types.ObjectId; // Değişikliği yapan admin
  createdAt: Date; // Değişiklik tarihi
  notes: string; // İsteğe bağlı notlar (değişiklik sebebi vb.)
}

const CoinPriceHistorySchema = new Schema<ICoinPriceHistory>({
  pricePerUnit: { type: Number, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

// Tarih bazlı sıralama
CoinPriceHistorySchema.index({ createdAt: -1 });

export const CoinPriceHistory = mongoose.model<ICoinPriceHistory>('CoinPriceHistory', CoinPriceHistorySchema); 