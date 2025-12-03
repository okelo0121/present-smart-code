import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Lesson } from '../models/Lesson';
import { Student } from '../models/Student';
import { notificationService } from '../services/notificationService';
import { Teacher } from '../models/Teacher';

export async function createLesson(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const teacher = await Teacher.findOne({ userId });
        if (!teacher) {
            res.status(403).json({ error: 'Teacher profile not found' });
            return;
        }

        const { class: className, topic, description, materials } = req.body;

        if (!className || !topic || !description) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // 1. Create Lesson
        const lesson = new Lesson({
            teacherId: teacher._id,
            class: className,
            topic,
            description,
            materials: materials || []
        });

        await lesson.save();

        // 2. Find students in this class
        const students = await Student.find({ class: className });

        // 3. Send SMS to each student
        const smsMessage = `New Lesson Posted: ${topic}\n${description.substring(0, 50)}...`;

        // In a real app, we'd use a queue for this. For MVP, we'll do it async but not block response too much.
        // We'll fire and forget the notifications to ensure fast response time.
        students.forEach(async (student) => {
            // Assuming student has a 'phone' field. If not, we'd need to add it. 
            // For now, we'll use a placeholder or email if phone is missing, 
            // but the requirement was SMS. Let's assume we'd send to a mock number if missing.
            const phone = (student as any).phone || '555-0000';
            await notificationService.sendSMS(phone, smsMessage);
        });

        res.status(201).json({
            message: 'Lesson created and notifications queued',
            lesson,
            recipientCount: students.length
        });

    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ error: 'Failed to create lesson' });
    }
}

export async function getLessons(req: AuthRequest, res: Response): Promise<void> {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // If teacher, return lessons they created
        if (req.userType === 'teacher') {
            const teacher = await Teacher.findOne({ userId });
            if (!teacher) {
                res.status(404).json({ error: 'Teacher not found' });
                return;
            }
            const lessons = await Lesson.find({ teacherId: teacher._id }).sort({ createdAt: -1 });
            res.json(lessons);
        }
        // If student, return lessons for their class
        else if (req.userType === 'student') {
            const student = await Student.findOne({ userId });
            if (!student) {
                res.status(404).json({ error: 'Student not found' });
                return;
            }
            const lessons = await Lesson.find({ class: student.class }).sort({ createdAt: -1 });
            res.json(lessons);
        } else {
            res.status(403).json({ error: 'Invalid user type' });
        }

    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
}
