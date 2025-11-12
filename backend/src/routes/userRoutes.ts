import { Router } from 'express';
import {
  getTeacherProfile,
  getTeacherStudents,
  inviteStudent,
  getStudentProfile
} from '../controllers/userController';
import { authMiddleware, requireTeacher, requireStudent } from '../middleware/auth';

const router = Router();

// Teacher routes
router.get('/teacher/profile', authMiddleware, requireTeacher, getTeacherProfile);
router.get('/teacher/students', authMiddleware, requireTeacher, getTeacherStudents);
router.post('/teacher/invite-student', authMiddleware, requireTeacher, inviteStudent);

// Student routes
router.get('/student/profile', authMiddleware, requireStudent, getStudentProfile);

export default router;
