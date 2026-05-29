import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Common Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Admin Pages
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Classes from './pages/admin/Classes';
import Notices from './pages/admin/Notices';
import EmergencyAlerts from './pages/admin/EmergencyAlerts';

// Teacher Pages
import TeacherClasses from './pages/teacher/Classes';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherResults from './pages/teacher/Results';
import TeacherMessages from './pages/teacher/Messages';

// Parent Pages
import ParentAttendance from './pages/parent/Attendance';
import ParentResults from './pages/parent/Results';
import ParentMessages from './pages/parent/Messages';

// Student Pages
import StudentResults from './pages/student/Results';
import StudentNotices from './pages/student/Notices';

// Protected Route Wrapper Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-school-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="text-xs font-bold text-slate-500 block">Validating Session Security...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Layout wrapper to inject sidebar & headers around sub-routes
function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 pt-20 pb-12 px-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Main Role-Routing Dashboard hub */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Role-Protected endpoints */}
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Students />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/teachers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Teachers />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/classes" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Classes />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notices" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Notices />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/emergency-alerts" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <EmergencyAlerts />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            {/* Teacher Role-Protected endpoints */}
            <Route 
              path="/teacher/classes" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <TeacherClasses />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/attendance" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <TeacherAttendance />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/results" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <TeacherResults />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/messages" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <TeacherMessages />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            {/* Parent Role-Protected endpoints */}
            <Route 
              path="/parent/attendance" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardLayout>
                    <ParentAttendance />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parent/results" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardLayout>
                    <ParentResults />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parent/messages" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardLayout>
                    <ParentMessages />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            {/* Student Role-Protected endpoints */}
            <Route 
              path="/student/results" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <StudentResults />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/notices" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <StudentNotices />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all redirects */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
