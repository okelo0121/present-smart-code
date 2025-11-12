import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  userId?: Types.ObjectId;
  teacherId?: Types.ObjectId;
  name: string;
  email: string;
  department?: string;
  class?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    default: null
  },
  class: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Student = mongoose.model<IStudent>('Student', studentSchema);
