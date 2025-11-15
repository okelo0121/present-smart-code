import { Router } from 'express';
import { signup, signin, signout, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { verifyTurnstile } from '../middleware/turnstile';

const router = Router();

router.post('/signup', verifyTurnstile, signup);
router.post('/signin', verifyTurnstile, signin);
router.post('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;
