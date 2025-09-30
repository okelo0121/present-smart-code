import { useState } from "react";
import { BookOpen, Users, BarChart3, Settings, User, LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
  userType: 'teacher' | 'student';
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Layout = ({ children, userType, activeView, onViewChange }: LayoutProps) => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'generate-code', label: 'Generate Code', icon: BookOpen },
    { id: 'invite-students', label: 'Invite Students', icon: UserPlus },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const studentNavItems = [
    { id: 'enter-code', label: 'Enter Code', icon: BookOpen },
    { id: 'attendance', label: 'My Attendance', icon: BarChart3 },
  ];

  const navItems = userType === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      {/* Header */}
      <header className="bg-gradient-card border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EduTrack</h1>
                <p className="text-sm text-muted-foreground">Smart Attendance System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="capitalize">
                {userType}
              </Badge>
              <span className="text-sm text-muted-foreground hidden md:block">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1 p-6 bg-gradient-card h-fit">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    className={`w-full justify-start transition-smooth ${
                      activeView === item.id 
                        ? "bg-gradient-primary text-white shadow-soft" 
                        : "hover:bg-secondary/50"
                    }`}
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};