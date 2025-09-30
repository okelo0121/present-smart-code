import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      setCheckingRole(true);
      
      // Check if user is a teacher
      const { data: teacherData } = await supabase
        .from('app_b3583718a0_teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (teacherData) {
        setUserType('teacher');
        setCheckingRole(false);
        return;
      }
      
      // Check if user is a student
      const { data: studentData } = await supabase
        .from('app_b3583718a0_students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (studentData) {
        setUserType('student');
        setCheckingRole(false);
        return;
      }
      
      // If neither, they're a new teacher who just signed up
      setUserType('teacher');
      setCheckingRole(false);
    };
    
    if (user && !userType) {
      checkUserRole();
    }
  }, [user, userType]);

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
