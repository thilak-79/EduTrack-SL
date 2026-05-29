import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import ParentDashboard from './parent/ParentDashboard';
import StudentDashboard from './student/StudentDashboard';

export default function Dashboard() {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderDashboardContent = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'parent':
        return <ParentDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return (
          <div className="p-8 text-center text-slate-400 font-sans">
            Unauthorized session. Please log in with a valid account.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Main Dashboard Screen Viewport */}
        <main className="flex-1 pt-20 pb-12 px-6 overflow-y-auto animate-fade-in">
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
}
