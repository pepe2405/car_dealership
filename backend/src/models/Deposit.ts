import mongoose, { Document, Schema } from 'mongoose';

export interface IDeposit extends Document {
  listingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const depositSchema = new Schema<IDeposit>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'refunded'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


depositSchema.index({ listingId: 1 });
depositSchema.index({ userId: 1 });
depositSchema.index({ status: 1 });
depositSchema.index({ listingId: 1, userId: 1 }, { unique: true });

export const Deposit = mongoose.model<IDeposit>('Deposit', depositSchema); 