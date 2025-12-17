
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

interface IMonthlyStats {
    className: string;
    totalSessions: number;
    averageAttendance: number;
    genderStats: {
        male: number;
        female: number;
        other: number;
    };
}

async function sendMonthlyEmails() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB.');

        // Calculate dates: Previous Month
        const date = new Date();
        date.setDate(1); // First day of current month
        date.setHours(0, 0, 0, 0); // Start of today
        const endOfMonth = new Date(date); // Start of current month is the end of the previous month window (exclusive)

        // Go back to first day of previous month
        const startOfMonth = new Date(date);
        startOfMonth.setMonth(startOfMonth.getMonth() - 1);

        console.log(`Generating reports for: ${startOfMonth.toDateString()} to ${endOfMonth.toDateString()}`);

        const allTeachers = await Teacher.find().populate({ path: 'userId', model: User });
        const teachers = allTeachers.filter(t => (t.userId as any)?.userType === 'teacher');

        for (const teacher of teachers) {
            // Find codes created in the previous month
            const codes = await AttendanceCode.find({
                teacherId: teacher._id,
                createdAt: { $gte: startOfMonth, $lt: endOfMonth }
            });

            if (codes.length === 0) {
                console.log(`No attendance codes for teacher ${teacher.name} in the previous month. Skipping.`);
                continue;
            }

            // Group codes by class
            const classCodes: Record<string, typeof codes> = {};
            codes.forEach(code => {
                if (!classCodes[code.class]) {
                    classCodes[code.class] = [];
                }
                classCodes[code.class].push(code);
            });

            const stats: IMonthlyStats[] = [];

            for (const [className, classSessionCodes] of Object.entries(classCodes)) {
                const totalSessions = classSessionCodes.length;

                // Find total unique students for this class/teacher reference
                // (Might change over the month, but taking current snapshot or could track per session. Simplification: Use current)
                const totalStudents = await Student.countDocuments({
                    teacherId: teacher._id,
                    class: className
                });

                if (totalStudents === 0) continue; // Avoid division by zero if no students currently

                let totalAttendancePercentageSum = 0;

                // Aggregate gender stats across all sessions? 
                // Or better: Gender breakdown of the "Average Attendee" or "Unique Attendees"
                // Let's do: Gender Stats of Unique Active Students who attended at least once (or just class enrollment gender stats?)
                // The requirements asked for "percentage of students attended and absent also the gender percenatge"
                // Let's provide: Gender % of the enrolled students (since attendance % covers the 'present' dynamic).
                // OR Gender % of the PRESENT students on average. 
                // Let's stick to Gender % of the Total Enrolled Students for the class summary, as that doesn't fluctuate daily.

                const enrolledStudents = await Student.find({
                    teacherId: teacher._id,
                    class: className
                });

                const maleCount = enrolledStudents.filter(s => s.gender === 'male').length;
                const femaleCount = enrolledStudents.filter(s => s.gender === 'female').length;
                const otherCount = enrolledStudents.filter(s => s.gender === 'other' || !s.gender).length;

                // Calculate average attendance %
                for (const code of classSessionCodes) {
                    const records = await AttendanceRecord.countDocuments({ codeId: code._id });
                    const sessionPercentage = (records / totalStudents) * 100;
                    totalAttendancePercentageSum += sessionPercentage;
                }

                const averageAttendance = totalAttendancePercentageSum / totalSessions;

                stats.push({
                    className,
                    totalSessions,
                    averageAttendance,
                    genderStats: {
                        male: (maleCount / totalStudents) * 100,
                        female: (femaleCount / totalStudents) * 100,
                        other: (otherCount / totalStudents) * 100
                    }
                });
            }

            // Construct Email Content
            const emailHtml = `
        <h1>Monthly Student Report</h1>
        <p>Hello ${teacher.name},</p>
        <p>Here is your summary for <strong>${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>:</p>
        
        ${stats.map(stat => `
          <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0;">Class: ${stat.className}</h2>
            <p><strong>Total Sessions:</strong> ${stat.totalSessions}</p>
            <p><strong>Avg. Attendance:</strong> ${stat.averageAttendance.toFixed(1)}%</p>
            
            <h3>Class Gender Distribution</h3>
            <ul>
              <li>Male: ${stat.genderStats.male.toFixed(1)}%</li>
              <li>Female: ${stat.genderStats.female.toFixed(1)}%</li>
              <li>Other: ${stat.genderStats.other.toFixed(1)}%</li>
            </ul>
          </div>
        `).join('')}

        <p>Best regards,<br>Present Smart</p>
      `;

            // Send Email
            const { data, error } = await resend.emails.send({
                from: 'Present Smart <onboarding@resend.dev>',
                to: [teacher.email],
                subject: `Monthly Attendance Report - ${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                html: emailHtml,
            });

            if (error) {
                console.error(`Failed to send monthly email to ${teacher.email}:`, error);
            } else {
                console.log(`Monthly email sent to ${teacher.email}:`, data?.id);
            }
        }

        console.log('Monthly email process completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error in monthly email script:', error);
        process.exit(1);
    }
}

sendMonthlyEmails();
