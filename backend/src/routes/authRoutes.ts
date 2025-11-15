import { Router } from 'express';
import { signup, signin, signout, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
