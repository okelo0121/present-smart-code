import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userType?: 'teacher' | 'student';
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.userId = payload.userId;
    req.userEmail = payload.email;
    req.userType = payload.userType;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireTeacher(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userType !== 'teacher') {
    res.status(403).json({ error: 'This action requires teacher privileges' });
    return;
  }
  next();
}

export function requireStudent(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userType !== 'student') {
    res.status(403).json({ error: 'This action requires student privileges' });
    return;
  }
  next();
}
