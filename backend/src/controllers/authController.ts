import { Request, Response } from 'express';
import { User } from '../models/User';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { StudentInvite } from '../models/StudentInvite';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateInviteToken } from '../utils/jwt';
import { sendInviteEmail, sendWelcomeEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, userType, department, inviteToken } = req.body;

    // Validate input
    if (!email || !password || !name || !userType) {
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
    if (userType === 'teacher') {
      const teacher = new Teacher({
        userId: user._id,
        email: user.email,
        name,
        department: department || 'General'
      });
      await teacher.save();
    } else if (userType === 'student') {
      const student = new Student({
        userId: user._id,
        email: user.email,
        name
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
