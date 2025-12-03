import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AttendanceRecord } from '../models/AttendanceRecord';
import { AttendanceCode } from '../models/AttendanceCode';
import { Teacher } from '../models/Teacher';

export async function exportAttendanceCsv(req: AuthRequest, res: Response): Promise<void> {
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

        const teacherId = teacher._id;

        // Fetch all attendance codes created by this teacher
        const codes = await AttendanceCode.find({ teacherId });
        const codeIds = codes.map(code => code._id);

        // Fetch all attendance records for these codes
        // Populate student details and code details
        const records = await AttendanceRecord.find({ codeId: { $in: codeIds } })
            .populate('studentId', 'name email externalId department class')
            .populate('codeId', 'code createdAt')
            .sort({ submittedAt: -1 });

        // Define CSV headers
        const headers = [
            'Student Name',
            'Student Email',
            'Student ID (SIS)',
            'Department',
            'Class',
            'Attendance Code',
            'Date',
            'Time',
            'Status'
        ].join(',');

        // Transform records to CSV rows
        const rows = records.map(record => {
            const student = record.studentId as any;
            const code = record.codeId as any;
            const date = new Date(record.submittedAt);

            return [
                `"${student.name || ''}"`,
                `"${student.email || ''}"`,
                `"${student.externalId || ''}"`,
                `"${student.department || ''}"`,
                `"${student.class || ''}"`,
                `"${code.code || ''}"`,
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                'Present'
            ].join(',');
        });

        // Combine headers and rows
        const csvContent = [headers, ...rows].join('\n');

        // Set response headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_export_${new Date().toISOString().split('T')[0]}.csv`);

        // Send CSV content
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ error: 'Failed to export attendance data' });
    }
}
