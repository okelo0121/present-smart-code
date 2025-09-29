import { useState } from "react";
import { UserTypeSelector } from "@/components/UserTypeSelector";
import { Layout } from "@/components/Layout";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { StudentInterface } from "@/components/StudentInterface";

const Index = () => {
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [activeView, setActiveView] = useState('dashboard');

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
