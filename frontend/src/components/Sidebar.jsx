import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  FileSpreadsheet, 
  Bell, 
  AlertTriangle, 
  MessageSquare, 
  X,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  // Navigation configurations based on User Roles
  const menuItems = {
    admin: [
      { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { path: '/admin/students', label: t('students'), icon: Users },
      { path: '/admin/teachers', label: t('teachers'), icon: GraduationCap },
      { path: '/admin/classes', label: t('classes'), icon: BookOpen },
      { path: '/admin/notices', label: t('notices'), icon: Bell },
      { path: '/admin/emergency-alerts', label: t('alerts'), icon: ShieldAlert }
    ],
    teacher: [
      { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { path: '/teacher/classes', label: t('assignedClasses'), icon: BookOpen },
      { path: '/teacher/attendance', label: t('attendance'), icon: CalendarCheck },
      { path: '/teacher/results', label: t('resultEntry'), icon: FileSpreadsheet },
      { path: '/teacher/messages', label: t('messages'), icon: MessageSquare }
    ],
    parent: [
      { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { path: '/parent/attendance', label: t('childAttendance'), icon: CalendarCheck },
      { path: '/parent/results', label: t('childResults'), icon: FileSpreadsheet },
      { path: '/parent/messages', label: t('childInbox'), icon: MessageSquare }
    ],
    student: [
      { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { path: '/student/results', label: t('results'), icon: FileSpreadsheet },
      { path: '/student/notices', label: t('notices'), icon: Bell }
    ]
  };

  const activeLinks = menuItems[role] || [];

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-school-navy text-slate-100 z-50 transition-transform duration-300 border-r border-slate-800 flex flex-col no-print
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header Title */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-school-accent flex items-center justify-center font-extrabold text-white text-base shadow-md">
              S
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wide text-white leading-none mb-1 font-sans">
                SmartSchool <span className="text-school-accent">LK</span>
              </h2>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                Digital Education
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card Info */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/20">
          <div className="bg-slate-800/40 border border-slate-800 px-4 py-3.5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-300 font-sans border border-slate-600/30">
              {role ? role.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-sans mb-0.5">
                Authorized Session
              </p>
              <h4 className="text-xs font-bold text-white truncate font-sans">
                {user?.profile?.name || 'User Profile'}
              </h4>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {activeLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all font-sans
                  ${isActive 
                    ? 'bg-school-primary text-white shadow-md shadow-school-primary/20 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center bg-slate-950/20">
          <p className="text-[9px] text-slate-600 font-semibold font-sans tracking-wide">
            SmartSchool LK Portal v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
