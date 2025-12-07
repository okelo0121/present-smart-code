import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { InviteStudentForm } from "./InviteStudentForm";
import { useAuth, getAuthToken } from "@/hooks/useAuth";
import { Teacher, Student, AttendanceStats } from "@/types";
import { TeacherStats } from "./dashboard/TeacherStats";
import { CodeGenerator } from "./dashboard/CodeGenerator";
import { StudentList } from "./dashboard/StudentList";
import { TeacherProfile } from "./dashboard/TeacherProfile";
import { PostLesson } from "./dashboard/PostLesson";
import { StudentsByClass } from "./dashboard/StudentsByClass";
import { RecentAttendance } from "./dashboard/RecentAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

interface TeacherDashboardProps {
  activeView: string;
  onViewChange?: (view: string) => void;
}

export const TeacherDashboard = ({ activeView, onViewChange }: TeacherDashboardProps) => {
  console.log('[TeacherDashboard] Rendered with activeView:', activeView);

  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [studentsPresent, setStudentsPresent] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceStats[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, number>>({});
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log('[TeacherDashboard] State - currentCode:', currentCode, 'teacherData:', !!teacherData);

  const attendanceRate = totalStudents > 0 ? Math.round((studentsPresent / totalStudents) * 100) : 0;

  // Fetch teacher data and students
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;

      try {
        const token = getAuthToken();
        if (!token) return;

        // Fetch teacher profile
        const teacherRes = await fetch(`${API_URL}/users/teacher/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!teacherRes.ok) throw new Error('Failed to fetch teacher profile');
        const teacher = await teacherRes.json();
        setTeacherData(teacher);

        // Fetch students
        const studentsRes = await fetch(`${API_URL}/users/teacher/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!studentsRes.ok) throw new Error('Failed to fetch students');
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
        setTotalStudents(studentsData.length);

        // Count students by class
        const classCounts: Record<string, number> = {};
        studentsData.forEach((student: Student) => {
          const className = student.class || 'Unassigned';
          classCounts[className] = (classCounts[className] || 0) + 1;
        });
        setStudentsByClass(classCounts);

        // Fetch attendance stats
        const statsRes = await fetch(`${API_URL}/attendance/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!statsRes.ok) throw new Error('Failed to fetch attendance stats');
        const stats = await statsRes.json();
        setAttendanceData(stats.stats || []);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };

    fetchTeacherData();
  }, [user]);

  const generateCode = async () => {
    if (!teacherData) {
      console.warn('[generateCode] Teacher data not loaded yet');
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('[generateCode] No auth token found');
        return;
      }

      const response = await fetch(`${API_URL}/attendance/generate-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate code');
      }

      const data = await response.json();
      setCurrentCode(data.code);
      setTimeLeft(data.expiresIn);
      setStudentsPresent(0);

      toast({
        title: "Code Generated!",
        description: `New attendance code: ${data.code}`,
      });
    } catch (error: any) {
      console.error('[generateCode] Exception:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate code",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCurrentCode(null);
            toast({
              title: "Code Expired",
              description: "The attendance code has expired.",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, toast]);

  // Listen to real-time attendance submissions
  useEffect(() => {
    if (!currentCode || !teacherData) return;

    const fetchCurrentAttendance = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/attendance/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch attendance');
        const data = await response.json();

        if (data.stats && data.stats.length > 0) {
          const todayStats = data.stats[0];
          setStudentsPresent(todayStats.present);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    // Fetch immediately
    fetchCurrentAttendance();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchCurrentAttendance, 2000);

    return () => clearInterval(interval);
  }, [currentCode, teacherData]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (activeView === 'invite-students') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Invite Students</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            {teacherData?.department || 'Department'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InviteStudentForm />

          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-education-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Enter Student Details</p>
                    <p className="text-sm text-muted-foreground">Fill in the student's name, email, class, and department</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-education-secondary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Invitation Email Sent</p>
                    <p className="text-sm text-muted-foreground">The student receives a personalized invitation email with access instructions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-education-success text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Student Gets Access</p>
                    <p className="text-sm text-muted-foreground">Students click the link to access the system and start marking attendance</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-education-info/10 border border-education-info/20 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> Students will be added to your class and can immediately start marking attendance once they access the system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeView === 'generate-code') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Generate Attendance Code</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            {teacherData?.department || 'Department'}
          </Badge>
        </div>

        <CodeGenerator
          currentCode={currentCode}
          timeLeft={timeLeft}
          studentsPresent={studentsPresent}
          totalStudents={totalStudents}
          attendanceRate={attendanceRate}
          onGenerateCode={generateCode}
          formatTime={formatTime}
        />
      </div>
    );
  }

  if (activeView === 'students') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {selectedClass ? `${selectedClass} Students` : 'My Students'}
          </h2>
          <div className="flex items-center gap-2">
            {selectedClass && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedClass(null)}>
                Clear Filter
              </Button>
            )}
            <Badge variant="outline" className="text-education-info border-education-info">
              {teacherData?.department || 'Department'}
            </Badge>
          </div>
        </div>

        <StudentList
          students={selectedClass
            ? students.filter(s => (s.class || 'Unassigned') === selectedClass)
            : students
          }
        />
      </div>
    );
  }

  if (activeView === 'profile') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            {teacherData?.department || 'Department'}
          </Badge>
        </div>

        <TeacherProfile teacherData={teacherData} />
      </div>
    );
  }

  if (activeView === 'post-lesson') {
    return (
      <PostLesson
        department={teacherData?.department || 'Department'}
        studentsByClass={studentsByClass}
      />
    );
  }

  // Default dashboard view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Teacher Dashboard</h2>
        <Badge variant="outline" className="text-education-info border-education-info">
          {teacherData?.department || 'Department'}
        </Badge>
      </div>

      <TeacherStats
        totalStudents={totalStudents}
        studentsPresent={studentsPresent}
        attendanceRate={attendanceRate}
      />

      <StudentsByClass
        studentsByClass={studentsByClass}
        onClassClick={(className) => {
          setSelectedClass(className);
          onViewChange?.('students');
        }}
      />

      <RecentAttendance attendanceData={attendanceData} />
    </div>
  );
};