import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, GraduationCap } from "lucide-react";

interface UserTypeSelectorProps {
  onSelectUserType: (type: 'teacher' | 'student') => void;
}

export const UserTypeSelector = ({ onSelectUserType }: UserTypeSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-large">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            EduTrack
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Smart Attendance Management System for Modern Education
          </p>
          <p className="text-muted-foreground">
            Secure, real-time attendance tracking with time-sensitive codes
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="bg-gradient-card hover:shadow-medium transition-smooth cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto bg-education-primary/10 rounded-xl flex items-center justify-center group-hover:bg-education-primary/20 transition-smooth">
                <GraduationCap className="w-8 h-8 text-education-primary" />
              </div>
              <CardTitle className="text-xl">Teacher Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-primary rounded-full"></div>
                  <span>Generate time-sensitive attendance codes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-primary rounded-full"></div>
                  <span>Monitor real-time student check-ins</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-primary rounded-full"></div>
                  <span>View detailed attendance reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-primary rounded-full"></div>
                  <span>Manage student profiles</span>
                </li>
              </ul>
              <Button 
                onClick={() => onSelectUserType('teacher')}
                className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
              >
                Continue as Teacher
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card hover:shadow-medium transition-smooth cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto bg-education-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-education-secondary/20 transition-smooth">
                <Users className="w-8 h-8 text-education-secondary" />
              </div>
              <CardTitle className="text-xl">Student Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-secondary rounded-full"></div>
                  <span>Enter attendance codes quickly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-secondary rounded-full"></div>
                  <span>View your attendance history</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-secondary rounded-full"></div>
                  <span>Track attendance statistics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-education-secondary rounded-full"></div>
                  <span>Secure and fast check-in</span>
                </li>
              </ul>
              <Button 
                onClick={() => onSelectUserType('student')}
                variant="secondary"
                className="w-full bg-gradient-secondary hover:bg-education-secondary transition-smooth"
              >
                Continue as Student
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-education-success/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-education-success" />
            </div>
            <h3 className="font-medium">Real-time Tracking</h3>
            <p className="text-sm text-muted-foreground">Live attendance monitoring with instant updates</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-education-warning/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-education-warning" />
            </div>
            <h3 className="font-medium">Secure Codes</h3>
            <p className="text-sm text-muted-foreground">Time-limited codes prevent sharing and fraud</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-education-info/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-education-info" />
            </div>
            <h3 className="font-medium">Smart Analytics</h3>
            <p className="text-sm text-muted-foreground">Detailed reports and attendance insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};