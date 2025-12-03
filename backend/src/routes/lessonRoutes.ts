import { Router } from 'express';
import { createLesson, getLessons } from '../controllers/lessonController';
import { authMiddleware, requireTeacher } from '../middleware/auth';

const router = Router();

// Create a lesson (Teachers only)
router.post('/', authMiddleware, requireTeacher, createLesson);

// Get lessons (Teachers see theirs, Students see theirs)
router.get('/', authMiddleware, getLessons);

export default router;
