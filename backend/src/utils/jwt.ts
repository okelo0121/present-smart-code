import jwt from 'jsonwebtoken';


export interface TokenPayload {
  userId: string;
  email: string;
  userType: 'teacher' | 'student';
}

function getSecret(): string {
  return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getSecret()) as TokenPayload;
  return decoded;
}

export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
