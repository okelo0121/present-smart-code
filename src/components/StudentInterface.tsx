import { useState } from "react";
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

interface StudentInterfaceProps {
  activeView: string;
}

export const StudentInterface = ({ activeView }: StudentInterfaceProps) => {
  const [enteredCode, setEnteredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);
  const { toast } = useToast();

  // Mock student data
  const studentInfo = {
    name: "John Doe",
    studentId: "CS2024001",
    department: "Computer Science",
    semester: "Fall 2024"
  };

  const mockAttendanceHistory = [
    { date: "Oct 21, 2024", status: "present", time: "9:15 AM", class: "Data Structures" },
    { date: "Oct 20, 2024", status: "present", time: "9:12 AM", class: "Data Structures" },
    { date: "Oct 19, 2024", status: "absent", time: "-", class: "Data Structures" },
    { date: "Oct 18, 2024", status: "present", time: "9:18 AM", class: "Data Structures" },
    { date: "Oct 17, 2024", status: "present", time: "9:08 AM", class: "Data Structures" },
  ];

  const presentDays = mockAttendanceHistory.filter(day => day.status === "present").length;
  const totalDays = mockAttendanceHistory.length;
  const attendancePercentage = Math.round((presentDays / totalDays) * 100);

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

    // Simulate API call
    setTimeout(() => {
      if (enteredCode.length === 6) {
        setTodayMarked(true);
        toast({
          title: "Attendance Marked!",
          description: `You've been marked present for today's class.`,
        });
        setEnteredCode("");
      } else {
        toast({
          title: "Invalid Code",
          description: "The code you entered is invalid or has expired.",
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    }, 1500);
  };

  if (activeView === 'enter-code') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Mark Attendance</h2>
          <Badge variant="outline" className="text-education-info border-education-info">
            {studentInfo.department}
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
                  <span className="text-sm text-muted-foreground">Student ID</span>
                  <span className="font-medium">{studentInfo.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Class</span>
                  <span className="font-medium">Data Structures</span>
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
          {studentInfo.semester}
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
            {mockAttendanceHistory.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {record.status === "present" ? (
                    <CheckCircle className="w-5 h-5 text-education-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">{record.date}</p>
                    <p className="text-sm text-muted-foreground">{record.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={record.status === "present" ? "default" : "destructive"}
                    className={record.status === "present" ? "bg-education-success" : ""}
                  >
                    {record.status === "present" ? "Present" : "Absent"}
                  </Badge>
                  {record.time !== "-" && (
                    <p className="text-xs text-muted-foreground mt-1">{record.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};