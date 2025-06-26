import mongoose, { Schema, Document } from 'mongoose';

export interface ITestDriveRequest extends Document {
  car: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestDriveRequestSchema = new Schema<ITestDriveRequest>({
  car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: { type: String },
}, { timestamps: true });

export default mongoose.model<ITestDriveRequest>('TestDriveRequest', TestDriveRequestSchema); 