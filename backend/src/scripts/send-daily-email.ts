
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Resend } from 'resend';
// Import User FIRST to ensure schema is registered before Teacher uses it in populate
import { User } from '../models/User';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { AttendanceCode } from '../models/AttendanceCode';
import { AttendanceRecord } from '../models/AttendanceRecord';

// Load environment variables
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

if (!RESEND_API_KEY || !MONGODB_URI) {
    console.error('Missing required environment variables: RESEND_API_KEY or MONGODB_URI');
    process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

interface IDailyStats {
    className: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
    genderStats: {
        male: number;
        female: number;
        other: number;
    };
}

async function sendDailyEmails() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB.');

        // Find all teachers and filter by userType
        const allTeachers = await Teacher.find().populate({ path: 'userId', model: User });
        const teachers = allTeachers.filter(t => (t.userId as any)?.userType === 'teacher');
        console.log(`Found ${teachers.length} teachers (filtered from ${allTeachers.length} total profiles).`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        for (const teacher of teachers) {
            // Find codes created today by this teacher
            const codes = await AttendanceCode.find({
                teacherId: teacher._id,
                createdAt: { $gte: today, $lt: tomorrow }
            });

            if (codes.length === 0) {
                console.log(`No attendance codes for teacher ${teacher.name} today. Skipping.`);
                continue;
            }

            const stats: IDailyStats[] = [];

            for (const code of codes) {
                const className = code.class;

                // Find total students in this class for this teacher
                // Assuming students are linked to teacher and have a class field
                // This logic might need adjustment based on how classes are strictly defined in the DB
                // For now, matching by teacherId and exact class string
                const totalStudents = await Student.countDocuments({
                    teacherId: teacher._id,
                    class: className
                });

                // Find attendance records for this code
                const records = await AttendanceRecord.find({ codeId: code._id });
                const presentStudentIds = records.map(r => r.studentId);

                const presentStudents = await Student.find({ _id: { $in: presentStudentIds } });

                const presentCount = presentStudents.length;
                const absentCount = Math.max(0, totalStudents - presentCount); // Ensure non-negative
                const attendancePercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

                // Calculate gender stats for PRESENT students (or total? Request implied stats for the report generally)
                // Usually stats are interesting for who showed up vs who didn't, but "gender percentage" usually implies of the class or of the attendees.
                // Let's do breakdown of Present students for now as it's more definitive data we have in hand.
                // Actually, let's do stats of the ATTENDEES.

                const maleCount = presentStudents.filter(s => s.gender === 'male').length;
                const femaleCount = presentStudents.filter(s => s.gender === 'female').length;
                const otherCount = presentStudents.filter(s => s.gender === 'other' || !s.gender).length;

                stats.push({
                    className,
                    totalStudents,
                    presentCount,
                    absentCount,
                    attendancePercentage,
                    genderStats: {
                        male: maleCount,
                        female: femaleCount,
                        other: otherCount
                    }
                });
            }

            // Construct Email Content
            const emailHtml = `
        <h1>Daily Student Report</h1>
        <p>Hello ${teacher.name},</p>
        <p>Here is your daily attendance summary for ${today.toDateString()}:</p>
        
        ${stats.map(stat => `
          <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0;">Class: ${stat.className}</h2>
            <p><strong>Attendance:</strong> ${stat.attendancePercentage.toFixed(1)}% (${stat.presentCount}/${stat.totalStudents})</p>
            <p><strong>Absent:</strong> ${stat.absentCount}</p>
            
            <h3>Attendees Breakdown</h3>
            <ul>
              <li>Male: ${stat.genderStats.male}</li>
              <li>Female: ${stat.genderStats.female}</li>
              <li>Other: ${stat.genderStats.other}</li>
            </ul>
          </div>
        `).join('')}

        <p>Best regards,<br>Present Smart</p>
      `;

            // Send Email
            const { data, error } = await resend.emails.send({
                from: 'Present Smart <onboarding@resend.dev>', // Update this if verified domain is available
                to: [teacher.email],
                subject: `Daily Attendance Report - ${today.toDateString()}`,
                html: emailHtml,
            });

            if (error) {
                console.error(`Failed to send email to ${teacher.email}:`, error);
            } else {
                console.log(`Email sent to ${teacher.email}:`, data?.id);
            }
        }

        console.log('Daily email process completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error in daily email script:', error);
        process.exit(1);
    }
}

sendDailyEmails();
