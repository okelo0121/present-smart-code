import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { StudentInterface } from "@/components/StudentInterface";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Read role from backend-provided user object
    // `useAuth` stores `user` with a shape { id, email, name, userType, emailVerified }
    const userTypeFromBackend = (user as any).userType as 'teacher' | 'student' | undefined;

    if (userTypeFromBackend) {
      setUserType(userTypeFromBackend);
    } else {
      // If the user type is missing, assume 'student' as a safer default
      setUserType('student');
    }

    setCheckingRole(false);
  }, [user]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userType) {
    return null;
  }

  // Set default view based on user type
  const defaultView = userType === 'teacher' ? 'dashboard' : 'enter-code';
  const currentView = activeView === 'dashboard' && userType === 'student' ? 'attendance' : activeView;

  return (
    <Layout 
      userType={userType} 
      activeView={currentView || defaultView}
      onViewChange={setActiveView}
    >
      {userType === 'teacher' ? (
        <TeacherDashboard activeView={currentView || defaultView} />
      ) : (
        <StudentInterface activeView={currentView || defaultView} />
      )}
    </Layout>
  );
};

export default Index;
