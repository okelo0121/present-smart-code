import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  RefreshCw,
  QrCode,
  TrendingUp,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InviteStudentForm } from "./InviteStudentForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TeacherDashboardProps {
  activeView: string;
}

export const TeacherDashboard = ({ activeView }: TeacherDashboardProps) => {
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [studentsPresent, setStudentsPresent] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const attendanceRate = totalStudents > 0 ? Math.round((studentsPresent / totalStudents) * 100) : 0;

  // Fetch teacher data and students
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;

      const { data: teacher, error: teacherError } = await supabase
        .from('app_b3583718a0_teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (teacherError) {
        return;
      }

      setTeacherData(teacher);

      // Fetch students for this teacher
      const { data: students, error: studentsError } = await supabase
        .from('app_b3583718a0_students')
        .select('*')
        .eq('teacher_id', teacher.id);

      if (studentsError) {
        return;
      }

      setTotalStudents(students?.length || 0);

      // Count students by class
      const classCounts: Record<string, number> = {};
      students?.forEach(student => {
        classCounts[student.class] = (classCounts[student.class] || 0) + 1;
      });
      setStudentsByClass(classCounts);

      // Fetch attendance records for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: codes } = await supabase
        .from('app_b3583718a0_attendance_codes')
        .select('id, code, class, created_at')
        .eq('teacher_id', teacher.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (codes) {
        const attendanceByDay: Record<string, { present: number; total: number; date: string }> = {};

        for (const code of codes) {
          const dateKey = new Date(code.created_at).toLocaleDateString();
          
          if (!attendanceByDay[dateKey]) {
            attendanceByDay[dateKey] = { present: 0, total: students?.length || 0, date: dateKey };
          }

          const { data: records } = await supabase
            .from('app_b3583718a0_attendance_records')
            .select('student_id')
            .eq('code_id', code.id);

          attendanceByDay[dateKey].present += records?.length || 0;
        }

        const formattedData = Object.values(attendanceByDay).map(day => ({
          date: day.date,
          present: day.present,
          absent: day.total - day.present,
          rate: day.total > 0 ? Math.round((day.present / day.total) * 100) : 0
        }));

        setAttendanceData(formattedData);
      }
    };

    fetchTeacherData();
  }, [user]);

  const generateCode = async () => {
    if (!teacherData) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2);

    const { error } = await supabase
      .from('app_b3583718a0_attendance_codes')
      .insert({
        code,
        teacher_id: teacherData.id,
        class: teacherData.department,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate code",
        variant: "destructive",
      });
      return;
    }

    setCurrentCode(code);
    setTimeLeft(120);
    setStudentsPresent(0);
    
    toast({
      title: "Code Generated!",
      description: `New attendance code: ${code}`,
    });
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
      const { data: codeData } = await supabase
        .from('app_b3583718a0_attendance_codes')
        .select('id')
        .eq('code', currentCode)
        .eq('teacher_id', teacherData.id)
        .single();

      if (codeData) {
        const { data: records } = await supabase
          .from('app_b3583718a0_attendance_records')
          .select('id')
          .eq('code_id', codeData.id);

        setStudentsPresent(records?.length || 0);
      }
    };

    fetchCurrentAttendance();

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_b3583718a0_attendance_records'
        },
        () => {
          fetchCurrentAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
                onClick={generateCode} 
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
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-education-primary" />
            <span>Recent Attendance Reports</span>
          </CardTitle>
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