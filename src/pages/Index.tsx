import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserTypeSelector } from "@/components/UserTypeSelector";
import { Layout } from "@/components/Layout";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { StudentInterface } from "@/components/StudentInterface";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!userType) {
    return <UserTypeSelector onSelectUserType={setUserType} />;
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
