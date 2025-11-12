import { Response } from 'express';
import { AttendanceCode } from '../models/AttendanceCode';
import { AttendanceRecord } from '../models/AttendanceRecord';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { AuthRequest } from '../middleware/auth';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function generateAttendanceCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    console.log('[generateCode] Request from user:', req.userId);
    
    const teacher = await Teacher.findOne({ userId: req.userId });
    console.log('[generateCode] Teacher lookup result:', teacher ? `Found: ${teacher._id}` : 'Not found');
    
    if (!teacher) {
      console.warn('[generateCode] Teacher profile not found for userId:', req.userId);
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2); // 2 minute expiry

    const attendanceCode = new AttendanceCode({
      code,
      teacherId: teacher._id,
      class: teacher.department,
      expiresAt
    });

    await attendanceCode.save();
    console.log('[generateCode] Code created successfully:', code);

    res.status(201).json({
      code,
      expiresAt,
      expiresIn: 120 // seconds
    });
  } catch (error) {
    console.error('[generateCode] Error:', error);
    res.status(500).json({ error: 'Failed to generate attendance code' });
  }
}

export async function submitAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    // Find the attendance code
    const attendanceCode = await AttendanceCode.findOne({ code: code.toUpperCase() });
    if (!attendanceCode) {
      res.status(404).json({ error: 'Invalid attendance code' });
      return;
    }

    // Check if expired
    if (attendanceCode.expiresAt < new Date()) {
      res.status(400).json({ error: 'Code has expired' });
      return;
    }

    // Find the student
    const student = await Student.findOne({ userId: req.userId });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    // Check if already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecord = await AttendanceRecord.findOne({
      studentId: student._id,
      codeId: attendanceCode._id,
      submittedAt: { $gte: today, $lt: tomorrow }
    });

    if (existingRecord) {
      res.status(400).json({ error: 'You have already marked attendance today' });
      return;
    }

    // Create attendance record
    const record = new AttendanceRecord({
      studentId: student._id,
      codeId: attendanceCode._id,
      submittedAt: new Date()
    });

    await record.save();

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      record
    });
  } catch (error) {
    console.error('Submit attendance error:', error);
    res.status(500).json({ error: 'Failed to submit attendance' });
  }
}

export async function getAttendanceHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const records = await AttendanceRecord.find({ studentId: student._id })
      .populate('codeId')
      .sort({ submittedAt: -1 })
      .limit(50);

    res.json(records);
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ error: 'Failed to get attendance history' });
  }
}

export async function getAttendanceStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    const students = await Student.find({ teacherId: teacher._id });
    const studentIds = students.map(s => s._id);

    // Get attendance codes for this teacher (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const codes = await AttendanceCode.find({
      teacherId: teacher._id,
      createdAt: { $gte: sevenDaysAgo }
    });

    const codeIds = codes.map(c => c._id);

    // Get attendance records
    const records = await AttendanceRecord.find({
      studentId: { $in: studentIds },
      codeId: { $in: codeIds }
    });

    // Group by date
    const statsByDate: Record<string, { present: number; total: number; date: string }> = {};

    codes.forEach(code => {
      const dateKey = new Date(code.createdAt).toLocaleDateString();
      if (!statsByDate[dateKey]) {
        statsByDate[dateKey] = { present: 0, total: students.length, date: dateKey };
      }
    });

    records.forEach(record => {
      const dateKey = new Date(record.submittedAt).toLocaleDateString();
      if (statsByDate[dateKey]) {
        statsByDate[dateKey].present += 1;
      }
    });

    const stats = Object.values(statsByDate).map(day => ({
      date: day.date,
      present: day.present,
      absent: day.total - day.present,
      rate: day.total > 0 ? Math.round((day.present / day.total) * 100) : 0
    }));

    res.json({
      totalStudents: students.length,
      stats
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Failed to get attendance statistics' });
  }
}
