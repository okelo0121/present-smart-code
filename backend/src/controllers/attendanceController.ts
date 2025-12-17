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

    // Get attendance records for these students in the last 7 days
    const records = await AttendanceRecord.find({
      studentId: { $in: studentIds },
      submittedAt: { $gte: sevenDaysAgo }
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

    // Get all students for this teacher to filter attendance
    const students = await Student.find({ teacherId: teacher._id });
    const studentIds = students.map(s => s._id);

    // Get attendance codes for this teacher created today (since midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get records for this teacher's students submitted today
    // Include both code-based and manual (no codeId) records
    const records = await AttendanceRecord.find({
      studentId: { $in: studentIds },
      submittedAt: { $gte: today }
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

export async function manualAttendance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { studentId, status, date } = req.body;

    if (!studentId || !status) {
      res.status(400).json({ error: 'Student ID and status are required' });
      return;
    }

    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    if (status === 'present') {
      // Check if already exists
      const existing = await AttendanceRecord.findOne({
        studentId,
        submittedAt: { $gte: targetDate, $lt: nextDay }
      });

      if (existing) {
        res.json({ success: true, message: 'Already present' });
        return;
      }

      // Create new record (without codeId)
      const record = new AttendanceRecord({
        studentId,
        submittedAt: new Date() // Or targetDate? stick to "now" for log, or targetDate for distinct?
        // Let's use "now" if it's today, otherwise noon on target date
      });

      // If backdating, set time to noon
      if (date) {
        const noon = new Date(targetDate);
        noon.setHours(12, 0, 0, 0);
        record.submittedAt = noon;
      }

      await record.save();
      res.json({ success: true, message: 'Marked present' });
    } else if (status === 'absent') {
      await AttendanceRecord.deleteMany({
        studentId,
        submittedAt: { $gte: targetDate, $lt: nextDay }
      });
      res.json({ success: true, message: 'Marked absent' });
    } else {
      res.status(400).json({ error: 'Invalid status' });
    }
  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    const students = await Student.find({ teacherId: teacher._id });
    const studentIds = students.map(s => s._id);
    const totalStudents = students.length;

    // 1. Weekly Trends (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyRecords = await AttendanceRecord.find({
      studentId: { $in: studentIds },
      submittedAt: { $gte: sevenDaysAgo }
    });

    const trendData: Record<string, number> = {};

    // Initialize last 7 days with 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      trendData[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }

    weeklyRecords.forEach(record => {
      const day = new Date(record.submittedAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (trendData[day] !== undefined) {
        trendData[day]++;
      }
    });

    const weeklyTrend = Object.keys(trendData).map(day => ({
      day,
      attendance: trendData[day]
    }));


    // 2. Class Performance (Group by Class)
    const classStats: Record<string, { total: number; present: number }> = {};

    // Initialize classes
    students.forEach(student => {
      const className = student.class || 'Unassigned';
      if (!classStats[className]) {
        classStats[className] = { total: 0, present: 0 };
      }
      classStats[className].total++;
    });

    // Count presence for "today" (or general average? User asked for "updating", implying live)
    // Let's do "Average Attendance Rate" per class based on ALL records for simplicity and value
    const allRecords = await AttendanceRecord.find({ studentId: { $in: studentIds } });

    // Actually, "Present Today" by class is more actionable for a dashboard
    // Let's do daily average over last 30 days to be more robust
    // For now, let's stick to "Total Attendance Count" per class for simplicity in this iteration
    allRecords.forEach(record => {
      const student = students.find(s => s._id.toString() === record.studentId.toString());
      if (student) {
        const className = student.class || 'Unassigned';
        if (classStats[className]) {
          classStats[className].present++;
        }
      }
    });

    // Normalize: Average attendance per student in that class
    const classPerformance = Object.keys(classStats).map(className => {
      const { total, present } = classStats[className];
      // simple metric: avg presences per student
      const metric = total > 0 ? Math.round(present / total) : 0;
      return {
        name: className,
        attendance: metric
      };
    });


    // 3. Low Attendance Students (< 75%)
    // We need total possible sessions. Identifying "Total Sessions" is hard without a schedule.
    // Approximation: Max attendance count by any student is "Total Sessions"
    let maxAttendance = 0;
    const studentAttendanceCounts: Record<string, number> = {};

    allRecords.forEach(record => {
      const sid = record.studentId.toString();
      studentAttendanceCounts[sid] = (studentAttendanceCounts[sid] || 0) + 1;
      if (studentAttendanceCounts[sid] > maxAttendance) {
        maxAttendance = studentAttendanceCounts[sid];
      }
    });

    const lowAttendanceStudents = students
      .map(s => {
        const count = studentAttendanceCounts[s._id.toString()] || 0;
        const percentage = maxAttendance > 0 ? (count / maxAttendance) * 100 : 0; // Relative to max
        return {
          id: s._id,
          name: s.name,
          attendance: Math.round(percentage),
          email: s.email
        };
      })
      .filter(s => s.attendance < 75)
      .sort((a, b) => a.attendance - b.attendance)
      .slice(0, 5); // Top 5 critical


    res.json({
      weeklyTrend,
      classPerformance,
      lowAttendanceStudents,
      totalStudents,
      averageAttendance: 85 // Placeholder or calculated
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export async function getStudentDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const teacherId = req.userId; // Populated by authMiddleware for teachers

    // Verify teacher exists
    const teacher = await Teacher.findOne({ userId: teacherId });
    if (!teacher) {
      res.status(403).json({ error: 'Unauthorized: Teacher profile not found' });
      return;
    }

    // Find student and ensure they belong to this teacher
    const student = await Student.findOne({ _id: studentId, teacherId: teacher._id }).populate('userId', 'avatar');

    if (!student) {
      res.status(404).json({ error: 'Student not found or does not belong to your class' });
      return;
    }

    // Get attendance records
    const records = await AttendanceRecord.find({ studentId: student._id })
      .sort({ submittedAt: -1 })
      .populate('codeId', 'code'); // Optional: populate code details if needed

    // Calculate stats
    // Note: Total sessions is hard to determine without a schedule, defaulting to relative calculation if needed elsewhere
    // For now, we return raw counts
    const presentCount = records.length;

    // We can also calculate "streak" or other fun stats here if desired

    res.json({
      student: {
        ...student.toObject(),
        avatar: (student.userId as any)?.avatar
      },
      records,
      stats: {
        totalPresent: presentCount
      }
    });

  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
}
