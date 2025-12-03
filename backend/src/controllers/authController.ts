import { Request, Response } from 'express';
import { User } from '../models/User';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { StudentInvite } from '../models/StudentInvite';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateInviteToken } from '../utils/jwt';
import { sendInviteEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, userType, department, inviteToken, phone } = req.body;

    // If invite token is provided, force userType to 'student' for security
    const finalUserType = inviteToken ? 'student' : userType;

    // Validate input
    if (!email || !password || !name || !finalUserType) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      userType,
      emailVerified: !!inviteToken // Auto-verify if invited
    });

    await user.save();

    // Create profile based on user type
    if (finalUserType === 'teacher') {
      const teacher = new Teacher({
        userId: user._id,
        email: user.email,
        name,
        department: department || 'General'
      });
      await teacher.save();
    } else if (finalUserType === 'student') {
      const student = new Student({
        userId: user._id,
        email: user.email,
        name,
        phone: phone || null
      });
      await student.save();

      // Mark invite as used if provided
      if (inviteToken) {
        await StudentInvite.findOneAndUpdate(
          { token: inviteToken },
          { used: true }
        );
      }
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      userType: user.userType
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
}

export async function signin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      userType: user.userType
    });

    res.json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
}

export async function signout(req: AuthRequest, res: Response): Promise<void> {
  // JWT signout is handled client-side by removing token
  res.json({ message: 'Signed out successfully' });
}

export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      return;
    }

    // Generate reset token (using crypto for security)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Get frontend URL from environment or default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    // Send password reset email
    try {
      console.log('[FORGOT PASSWORD] Attempting to send reset email to:', user.email);
      console.log('[FORGOT PASSWORD] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
      console.log('[FORGOT PASSWORD] Frontend URL:', frontendUrl);
      await sendPasswordResetEmail(user.email, user.name, resetToken, frontendUrl);
      console.log('[FORGOT PASSWORD] Reset email sent successfully to:', user.email);
      console.log('[FORGOT PASSWORD] Reset link:', `${frontendUrl}/reset-password?token=${resetToken}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request, just log the error
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetLink: `${frontendUrl}/reset-password?token=${resetToken}` // Include link in response for testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' });
      return;
    }

    // Validate password strength
    const passwordValidation = z.string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/[a-z]/, "One lowercase letter")
      .regex(/[0-9]/, "One number")
      .safeParse(password);

    if (!passwordValidation.success) {
      const errors = passwordValidation.error.errors.map((e: any) => e.message).join(", ");
      res.status(400).json({ error: `Password requirements not met: ${errors}` });
      return;
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}
