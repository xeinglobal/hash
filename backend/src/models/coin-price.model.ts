import mongoose, { Document, Schema } from 'mongoose';

export interface ICoinPrice extends Document {
  pricePerUnit: number; // 1 coin için gerekli olan para birimi miktarı
  updatedBy: mongoose.Types.ObjectId; // Fiyatı güncelleyen admin
  updatedAt: Date;
  isActive: boolean;
}

const CoinPriceSchema = new Schema<ICoinPrice>({
  pricePerUnit: { type: Number, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Sadece tek bir aktif fiyat olması için, yeni bir aktif fiyat kaydedildiğinde
// diğer tüm fiyatları aktif olmayan olarak işaretleyen middleware
CoinPriceSchema.pre('save', async function (next) {
  if (this.isActive) {
    await mongoose.model('CoinPrice').updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { isActive: false }
    );
  }
  next();
});

export const CoinPrice = mongoose.model<ICoinPrice>('CoinPrice', CoinPriceSchema); 