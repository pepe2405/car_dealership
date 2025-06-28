import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaseOption extends Document {
  name: string;
  duration: number; // в месеци
  downPayment: number; // първоначална вноска (%)
  interestRate: number; // лихвен процент
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeaseOptionSchema = new Schema<ILeaseOption>({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  duration: { 
    type: Number, 
    required: true,
    min: 1,
    max: 60 
  },
  downPayment: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  },
  interestRate: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

export default mongoose.model<ILeaseOption>('LeaseOption', LeaseOptionSchema); 