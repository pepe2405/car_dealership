import mongoose, { Document, Schema } from 'mongoose';

export interface ISale extends Document {
  carId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  saleType: 'full' | 'leasing';
  totalAmount: number;
  downPayment?: number;
  monthlyPayment?: number;
  leaseTerm?: number; // in months
  interestRate?: number;
  status: 'pending' | 'completed' | 'cancelled';
  saleDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>({
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  saleType: {
    type: String,
    enum: ['full', 'leasing'],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  downPayment: {
    type: Number,
    min: 0,
  },
  monthlyPayment: {
    type: Number,
    min: 0,
  },
  leaseTerm: {
    type: Number,
    min: 1,
    max: 120, // 10 years max
  },
  interestRate: {
    type: Number,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

// Index for better query performance
SaleSchema.index({ carId: 1, buyerId: 1 });
SaleSchema.index({ sellerId: 1 });
SaleSchema.index({ status: 1 });

export default mongoose.model<ISale>('Sale', SaleSchema); 