export interface User {
    id: string;
    email: string;
    name: string;
    userType: 'teacher' | 'student';
    emailVerified: boolean;
}

export interface Teacher {
    _id: string;
    userId: string;
    name: string;
    email: string;
    department: string;
    class: string;
    createdAt: string;
}

export interface Student {
    _id: string;
    name: string;
    email: string;
    class: string;
    department: string;
    createdAt: string;
}

export interface AttendanceStats {
    date: string;
    present: number;
    absent: number;
    rate: number;
}

export interface AttendanceRecord {
    studentId: string;
    code: string;
    submitDate: string;
    status: 'present' | 'absent';
}
