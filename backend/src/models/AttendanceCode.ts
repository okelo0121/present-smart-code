import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendanceCode extends Document {
  code: string;
  teacherId: Types.ObjectId;
  class: string;
  expiresAt: Date;
  createdAt: Date;
}

const attendanceCodeSchema = new Schema<IAttendanceCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto delete after 1 hour
  }
});

export const AttendanceCode = mongoose.model<IAttendanceCode>('AttendanceCode', attendanceCodeSchema);
