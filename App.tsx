import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { StudentDashboard } from './components/StudentDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { StudentProfile } from './components/StudentProfile';
import { ParentProfile } from './components/ParentProfile';
import { NoticeDetail } from './components/NoticeDetail';
import { CreateNotice } from './components/CreateNotice';
import { ReviewApplications } from './components/ReviewApplications';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'student';
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Get user profile from server
          const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-539c048d/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          
          if (response.ok) {
            const { profile } = await response.json();
            setUser(profile);
            setCurrentScreen(profile.userType === 'student' ? 'student-dashboard' : 'parent-dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentScreen(userData.userType === 'student' ? 'student-dashboard' : 'parent-dashboard');
  };

  const handleSignup = (userData: User) => {
    setUser(userData);
    setCurrentScreen(userData.userType === 'student' ? 'student-dashboard' : 'parent-dashboard');
  };

  const handleDemoMode = (userType: 'student' | 'parent') => {
    setDemoMode(true);
    const demoUser = {
      id: 'demo-' + userType,
      email: `demo-${userType}@example.com`,
      name: userType === 'student' ? 'Alex Demo (Student)' : 'Sarah Demo (Parent)',
      userType: userType
    };
    setUser(demoUser);
    setCurrentScreen(userType === 'student' ? 'student-dashboard' : 'parent-dashboard');
  };

  const exitDemoMode = () => {
    setDemoMode(false);
    setUser(null);
    setCurrentScreen('login');
  };

  const handleLogout = async () => {
    if (demoMode) {
      exitDemoMode();
      return;
    }
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onNavigate={setCurrentScreen} onLogin={handleLogin} onDemoMode={handleDemoMode} />;
      case 'signup':
        return <SignupScreen onNavigate={setCurrentScreen} onSignup={handleSignup} />;
      case 'student-dashboard':
        return <StudentDashboard 
          onNavigate={setCurrentScreen} 
          onSelectNotice={setSelectedNotice}
          user={user}
          onLogout={handleLogout}
          demoMode={demoMode}
        />;
      case 'parent-dashboard':
        return <ParentDashboard 
          onNavigate={setCurrentScreen} 
          onSelectNotice={setSelectedNotice}
          user={user}
          onLogout={handleLogout}
          demoMode={demoMode}
        />;
      case 'student-profile':
        return <StudentProfile 
          onNavigate={setCurrentScreen}
          user={user}
        />;
      case 'parent-profile':
        return <ParentProfile 
          onNavigate={setCurrentScreen}
          user={user}
        />;
      case 'notice-detail':
        return <NoticeDetail 
          notice={selectedNotice} 
          onNavigate={setCurrentScreen} 
          userType={user?.userType}
          user={user}
        />;
      case 'create-notice':
        return <CreateNotice 
          onNavigate={setCurrentScreen}
          user={user}
        />;
      case 'review-applications':
        return <ReviewApplications 
          notice={selectedNotice}
          onNavigate={setCurrentScreen}
        />;
      default:
        return <LoginScreen onNavigate={setCurrentScreen} onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderScreen()}
    </div>
  );
}