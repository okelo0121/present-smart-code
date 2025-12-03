import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  QrCode,
  TrendingUp,
  Calendar,
  Mail,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InviteStudentForm } from "./InviteStudentForm";
import { useAuth, getAuthToken } from "@/hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

interface TeacherDashboardProps {
  activeView: string;
}

export const TeacherDashboard = ({ activeView }: TeacherDashboardProps) => {
  console.log('[TeacherDashboard] Rendered with activeView:', activeView);

  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [studentsPresent, setStudentsPresent] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, number>>({});
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
        const students = await studentsRes.json();
        setStudents(students);
        setTotalStudents(students.length);

        // Count students by class
        const classCounts: Record<string, number> = {};
        students.forEach((student: any) => {
          classCounts[student.class] = (classCounts[student.class] || 0) + 1;
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
    console.log('[generateCode] Button clicked!');
    console.log('[generateCode] Teacher data:', teacherData);
    console.log('[generateCode] currentCode state:', currentCode);

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

      console.log('[generateCode] Calling endpoint:', `${API_URL}/attendance/generate-code`);
      const response = await fetch(`${API_URL}/attendance/generate-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[generateCode] Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[generateCode] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to generate code');
      }

      const data = await response.json();
      console.log('[generateCode] Success:', data);

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
            Computer Science Department
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
    console.log('[generateCodeView] Rendering generate-code view');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Generate Attendance Code</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            Computer Science Department
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code Generation Card */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-education-primary" />
                <span>Current Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentCode ? (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-primary text-white p-6 rounded-lg">
                    <p className="text-sm opacity-90">Attendance Code</p>
                    <p className="text-3xl font-bold tracking-wider">{currentCode}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-education-warning">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Time remaining: {formatTime(timeLeft)}</span>
                  </div>
                  <Progress value={(timeLeft / 120) * 100} className="w-full" />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-secondary rounded-full flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No active attendance session</p>
                </div>
              )}

              <Button
                onClick={() => {
                  console.log('[Button] Clicked! Current disabled state:', !!currentCode, 'currentCode value:', currentCode);
                  generateCode();
                }}
                disabled={!!currentCode}
                className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {currentCode ? "Session Active" : "Generate New Code"}
              </Button>
            </CardContent>
          </Card>

          {/* Real-time Attendance */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-education-secondary" />
                <span>Live Attendance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-education-success/10 rounded-lg border border-education-success/20">
                  <UserCheck className="w-6 h-6 mx-auto text-education-success mb-2" />
                  <p className="text-2xl font-bold text-education-success">{studentsPresent}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <UserX className="w-6 h-6 mx-auto text-destructive mb-2" />
                  <p className="text-2xl font-bold text-destructive">{totalStudents - studentsPresent}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance Rate</span>
                  <span className="font-medium">{attendanceRate}%</span>
                </div>
                <Progress value={attendanceRate} className="w-full" />
              </div>

              {currentCode && (
                <div className="text-center text-sm text-muted-foreground">
                  Students are marking attendance in real-time
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeView === 'students') {
    console.log('[studentsView] Rendering students view');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">My Students</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            Computer Science Department
          </Badge>
        </div>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-education-primary" />
              <span>Student List</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.class || 'Not assigned'}</Badge>
                      </TableCell>
                      <TableCell>{student.department || 'Not assigned'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students yet.</p>
                <p className="text-sm text-muted-foreground">Start by inviting students to your classes.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeView === 'profile') {
    console.log('[profileView] Rendering profile view');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            Computer Science Department
          </Badge>
        </div>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-education-primary" />
              <span>Teacher Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {teacherData ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-education-primary/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-education-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{teacherData.name}</h3>
                    <p className="text-muted-foreground">Teacher</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{teacherData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <Badge variant="outline" className="text-education-info border-education-info">
                          {teacherData.department}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="font-medium">
                          {new Date(teacherData.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading profile information...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default dashboard view
  console.log('[defaultDashboardView] Rendering default dashboard with activeView:', activeView);

  if (activeView === 'post-lesson') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Post Lesson & Notify</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            Computer Science Department
          </Badge>
        </div>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-education-primary" />
              <span>New Lesson Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const lessonData = {
                class: formData.get('class'),
                topic: formData.get('topic'),
                description: formData.get('description'),
              };

              try {
                const token = getAuthToken();
                if (!token) return;

                const response = await fetch(`${API_URL}/lessons`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(lessonData)
                });

                if (!response.ok) throw new Error('Failed to post lesson');

                const data = await response.json();
                toast({
                  title: "Lesson Posted!",
                  description: `Notification sent to ${data.recipientCount} students.`,
                });
                (e.target as HTMLFormElement).reset();
              } catch (error) {
                console.error('Error posting lesson:', error);
                toast({
                  title: "Error",
                  description: "Failed to post lesson.",
                  variant: "destructive",
                });
              }
            }} className="space-y-4">

              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <select name="class" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select a class</option>
                  {Object.keys(studentsByClass).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <input name="topic" required placeholder="e.g., Introduction to React" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description / Message</label>
                <textarea name="description" required placeholder="Brief description of the lesson..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary">
                <Mail className="w-4 h-4 mr-2" />
                Post & Send SMS
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Teacher Dashboard</h2>
        <Badge variant="outline" className="text-education-info border-education-info">
          Computer Science Department
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-education-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-education-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-education-success/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-education-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">{studentsPresent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <UserX className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold">{totalStudents - studentsPresent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-education-warning/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-education-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students by Class */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-education-primary" />
            <span>Students by Class</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(studentsByClass).length > 0 ? (
              Object.entries(studentsByClass).map(([className, count]) => (
                <div key={className} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-education-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-education-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{className}</p>
                      <p className="text-sm text-muted-foreground">{count} students</p>
                    </div>
                  </div>
                  <Badge className="bg-education-primary">
                    {count}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No students yet. Start by inviting students to your classes.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance Reports */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-education-primary" />
              <span>Recent Attendance Reports</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const token = getAuthToken();
                  if (!token) return;

                  const response = await fetch(`${API_URL}/attendance/export`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });

                  if (!response.ok) throw new Error('Failed to export CSV');

                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  toast({
                    title: "Export Successful",
                    description: "Attendance data has been downloaded.",
                  });
                } catch (error) {
                  console.error('Export error:', error);
                  toast({
                    title: "Export Failed",
                    description: "Could not download attendance data.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.length > 0 ? (
              attendanceData.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{day.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.present} present, {day.absent} absent
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{day.rate}%</p>
                      <Progress value={day.rate} className="w-20" />
                    </div>
                    <Badge
                      variant={day.rate >= 90 ? "default" : day.rate >= 80 ? "secondary" : "destructive"}
                      className={
                        day.rate >= 90
                          ? "bg-education-success"
                          : day.rate >= 80
                            ? "bg-education-warning"
                            : ""
                      }
                    >
                      {day.rate >= 90 ? "Excellent" : day.rate >= 80 ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No attendance records yet. Generate a code to start tracking attendance.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};