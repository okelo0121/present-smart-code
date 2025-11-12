import { Response } from 'express';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { StudentInvite } from '../models/StudentInvite';
import { generateInviteToken } from '../utils/jwt';
import { sendInviteEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';

export async function getTeacherProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    res.json(teacher);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: 'Failed to get teacher profile' });
  }
}

export async function getTeacherStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    const students = await Student.find({ teacherId: teacher._id });
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to get students' });
  }
}

export async function inviteStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, name, department, class: studentClass } = req.body;

    // Validate input
    if (!email || !name) {
      res.status(400).json({ error: 'Email and name are required' });
      return;
    }

    const teacher = await Teacher.findOne({ userId: req.userId });
    if (!teacher) {
      res.status(404).json({ error: 'Teacher profile not found' });
      return;
    }

    // Check if student already exists
    let student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      // Create new student record
      student = new Student({
        email: email.toLowerCase(),
        name,
        department: department || teacher.department,
        class: studentClass || teacher.department,
        teacherId: teacher._id
      });
      await student.save();
    } else if (!student.teacherId) {
      // Link existing student to teacher
      student.teacherId = teacher._id as any;
      student.department = department || teacher.department;
      student.class = studentClass || teacher.department;
      await student.save();
    }

    // Generate invite token (expires in 7 days)
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = new StudentInvite({
      email: email.toLowerCase(),
      token,
      expiresAt,
      createdBy: teacher._id
    });
    await invite.save();

    // Send invite email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
      await sendInviteEmail(email, name, teacher.name, token, frontendUrl);
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      message: 'Invitation sent successfully',
      inviteToken: token
    });
  } catch (error) {
    console.error('Invite student error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
}

export async function getStudentProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ userId: req.userId }).populate('teacherId');
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to get student profile' });
  }
}
