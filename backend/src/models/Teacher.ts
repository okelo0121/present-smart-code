import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITeacher extends Document {
  userId: Types.ObjectId;
  email: string;
  name: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    default: 'General'
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

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);
