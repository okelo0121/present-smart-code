import { Router } from 'express';
import {
  getTeacherProfile,
  getTeacherStudents,
  inviteStudent,
  getStudentProfile,
  uploadAvatar
} from '../controllers/userController';
import { authMiddleware, requireTeacher, requireStudent } from '../middleware/auth';

import { upload } from '../middleware/upload';

const router = Router();

// Common routes
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

// Teacher routes
router.get('/teacher/profile', authMiddleware, requireTeacher, getTeacherProfile);
router.get('/teacher/students', authMiddleware, requireTeacher, getTeacherStudents);
router.post('/teacher/invite-student', authMiddleware, requireTeacher, inviteStudent);

// Student routes
router.get('/student/profile', authMiddleware, requireStudent, getStudentProfile);

export default router;
