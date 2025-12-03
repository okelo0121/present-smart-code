import { Router } from 'express';
import {
  generateAttendanceCode,
  submitAttendance,
  getAttendanceHistory,
  getAttendanceStats
} from '../controllers/attendanceController';
import { exportAttendanceCsv } from '../controllers/exportController';
import { authMiddleware, requireTeacher, requireStudent } from '../middleware/auth';

const router = Router();

// Teacher routes
router.post('/generate-code', authMiddleware, requireTeacher, generateAttendanceCode);
router.get('/stats', authMiddleware, requireTeacher, getAttendanceStats);
router.get('/export', authMiddleware, requireTeacher, exportAttendanceCsv);

// Student routes
router.post('/submit', authMiddleware, requireStudent, submitAttendance);
router.get('/history', authMiddleware, requireStudent, getAttendanceHistory);

export default router;
