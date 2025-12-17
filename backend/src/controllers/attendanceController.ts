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
    const { geoFence } = req.body; // Expecting geoFence: { latitude, longitude, radius }
    if (geoFence) {
      console.log('[generateCode] with GeoFence:', JSON.stringify(geoFence));
    }

    const teacher = await Teacher.findOne({ userId: req.userId });

    if (!teacher) {
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
      expiresAt,
      geoFence // Optional
    });

    await attendanceCode.save();

    res.status(201).json({
      code,
      expiresAt,
      expiresIn: 120 // seconds
    });
  } catch (error: any) {
    console.error('[generateCode] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate attendance code' });
  }
}

// Haversine formula to calculate distance in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function submitAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, location } = req.body;

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

    // Geo-Fencing Validation
    if (attendanceCode.geoFence && attendanceCode.geoFence.latitude && attendanceCode.geoFence.longitude) {
      if (!location || !location.lat || !location.lng) {
        res.status(403).json({ error: 'Location permission required for this session' });
        return;
      }

      const distance = getDistanceFromLatLonInMeters(
        attendanceCode.geoFence.latitude,
        attendanceCode.geoFence.longitude,
        location.lat,
        location.lng
      );

      const maxRadius = attendanceCode.geoFence.radius || 100;

      console.log(`[GeoFence] Student dist: ${distance}m, Max: ${maxRadius}m`);

      if (distance > maxRadius) {
        res.status(403).json({
          error: 'You are too far from the classroom to mark attendance',
          details: `Distance: ${Math.round(distance)}m`
        });
        return;
      }
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

export async function getTodayAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    // Get attendance codes for this teacher created today (since midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const codes = await AttendanceCode.find({
      teacherId: teacher._id,
      createdAt: { $gte: today }
    });

    const codeIds = codes.map(c => c._id);

    // Get attendance records for these codes
    // We also need to check submittedAt just in case, but code creation is a good proxy for "today's session"
    const records = await AttendanceRecord.find({
      codeId: { $in: codeIds }
    });

    const presentStudentIds = records.map(r => r.studentId);

    res.json({
      presentStudentIds
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Failed to get today\'s attendance' });
  }
}
