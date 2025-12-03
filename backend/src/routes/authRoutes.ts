import { Router } from 'express';
import { signup, signin, signout, getCurrentUser, forgotPassword, resetPassword, debugCleanup } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', authMiddleware, signout);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/cleanup/:email', debugCleanup);

export default router;
