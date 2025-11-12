import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, getAuthToken } from "@/hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

interface StudentInterfaceProps {
  activeView: string;
}

export const StudentInterface = ({ activeView }: StudentInterfaceProps) => {
  const [enteredCode, setEnteredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch student data and attendance history
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      try {
        const token = getAuthToken();
        if (!token) return;

        // Fetch student info
        const studentRes = await fetch(`${API_URL}/users/student/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!studentRes.ok) throw new Error('Failed to fetch student profile');
        const student = await studentRes.json();
        setStudentInfo(student);

        // Check if already marked today
        const attendanceRes = await fetch(`${API_URL}/attendance/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!attendanceRes.ok) throw new Error('Failed to fetch attendance');
        const records = await attendanceRes.json();

        const today = new Date().toISOString().split('T')[0];
        const todayRecord = records.find((r: any) => 
          new Date(r.submittedAt).toISOString().split('T')[0] === today
        );

        setTodayMarked(!!todayRecord);
        setAttendanceHistory(records || []);
      } catch (error: any) {
        console.error('Error fetching student data:', error);
        toast({
          title: "Error",
          description: "Failed to load your information. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, toast]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid attendance code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${API_URL}/attendance/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: enteredCode.toUpperCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit attendance');
      }

      if (data.success) {
        setTodayMarked(true);
        toast({
          title: "Attendance Marked!",
          description: "You've been marked present for today's class.",
        });
        setEnteredCode("");

        // Refresh attendance history
        const historyRes = await fetch(`${API_URL}/attendance/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (historyRes.ok) {
          const records = await historyRes.json();
          setAttendanceHistory(records);
        }
      }
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "The code is invalid or has expired. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-education-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Student Profile Found</h3>
            <p className="text-muted-foreground">
              Your account hasn't been linked to a student profile yet. Please contact your teacher to send you an invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const presentDays = attendanceHistory.length;
  const totalDays = attendanceHistory.length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  if (activeView === 'enter-code') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Mark Attendance</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            {studentInfo?.department || 'Student'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code Entry Card */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-education-primary" />
                <span>Enter Attendance Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayMarked ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-education-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-education-success" />
                  </div>
                  <div>
                    <p className="font-medium text-education-success">Attendance Marked!</p>
                    <p className="text-sm text-muted-foreground">You're present for today's class</p>
                  </div>
                  <Badge className="bg-education-success">
                    Present - {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Attendance Code</label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="text-center text-lg font-mono tracking-wider"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get the code from your teacher
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
                    disabled={isSubmitting || enteredCode.length !== 6}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Marking Attendance...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Present
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Student Info Card */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-education-secondary" />
                <span>Today's Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Student Name</span>
                    <span className="font-medium">{studentInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Department</span>
                    <span className="font-medium">{studentInfo.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Class</span>
                    <span className="font-medium">{studentInfo.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  {todayMarked ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-education-success" />
                      <span className="text-education-success font-medium">Present Today</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-education-warning" />
                      <span className="text-education-warning font-medium">Not Marked Yet</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-gradient-card border-education-info/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-education-info mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-education-info">How to mark attendance:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Wait for your teacher to generate the attendance code</li>
                  <li>• Enter the 6-digit code exactly as shown</li>
                  <li>• Codes expire after 2 minutes for security</li>
                  <li>• You can only mark attendance once per class</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Attendance History View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Attendance</h2>
        <Badge variant="outline" className="text-education-info border-education-info">
          {studentInfo.class}
        </Badge>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-education-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-education-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classes Attended</p>
                <p className="text-2xl font-bold">{presentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classes Missed</p>
                <p className="text-2xl font-bold">{totalDays - presentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-education-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-education-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{attendancePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Progress */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Overall Attendance</span>
            <span className="font-medium">{attendancePercentage}%</span>
          </div>
          <Progress value={attendancePercentage} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{presentDays} of {totalDays} classes attended</span>
            <span>
              {attendancePercentage >= 90 ? "Excellent!" : 
               attendancePercentage >= 80 ? "Good attendance" : 
               "Needs improvement"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance History */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No attendance records yet</p>
                <p className="text-sm">Start marking your attendance to see your history</p>
              </div>
            ) : (
              attendanceHistory.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-education-success" />
                    <div>
                      <p className="font-medium">{new Date(record.submitted_at).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{studentInfo.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-education-success">Present</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(record.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};