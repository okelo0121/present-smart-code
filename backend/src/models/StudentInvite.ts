import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudentInvite extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  createdBy: Types.ObjectId;
}

const studentInviteSchema = new Schema<IStudentInvite>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }
});

export const StudentInvite = mongoose.model<IStudentInvite>('StudentInvite', studentInviteSchema);
