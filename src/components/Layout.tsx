import { useState } from "react";
import { BookOpen, Users, BarChart3, Settings, User, LogOut, UserPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    { id: 'post-lesson', label: 'Post Lesson', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const studentNavItems = [
    { id: 'enter-code', label: 'Enter Code', icon: BookOpen },
    { id: 'attendance', label: 'My Attendance', icon: BarChart3 },
  ];

  const navItems = userType === 'teacher' ? teacherNavItems : studentNavItems;

  const NavContent = () => (
    <nav className="space-y-2 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={activeView === item.id ? "default" : "ghost"}
            className={`w-full justify-start transition-smooth ${activeView === item.id
              ? "bg-gradient-primary text-white shadow-soft"
              : "hover:bg-secondary/50"
              }`}
            onClick={() => {
              onViewChange(item.id);
              setIsMobileOpen(false);
            }}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-gradient-card border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden mr-2">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-card">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-lg">EduTrack</span>
                    </div>
                  </div>
                  <NavContent />
                </SheetContent>
              </Sheet>

              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center hidden lg:flex">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground hidden lg:block">EduTrack</h1>
                <h1 className="text-xl font-bold text-foreground lg:hidden">EduTrack</h1>
                <p className="text-sm text-muted-foreground hidden lg:block">Smart Attendance System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="capitalize hidden sm:inline-flex">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="w-64 hidden lg:block border-r bg-card/50 backdrop-blur-sm overflow-y-auto">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-secondary/20 to-accent/20 p-4 md:p-6">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
