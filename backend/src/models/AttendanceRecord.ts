import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendanceRecord extends Document {
  studentId: Types.ObjectId;
  codeId: Types.ObjectId;
  submittedAt: Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  codeId: {
    type: Schema.Types.ObjectId,
    ref: 'AttendanceCode',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', attendanceRecordSchema);
