import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';
import { Bell, Languages, LogOut, User, Menu, BookOpen, MessageSquare } from 'lucide-react';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;
      try {
        const list = await api.get('/messages/history');
        // Filter out SMS and Email channels, keeping in-app or showing recent ones as alerts
        setNotifications(list.slice(0, 5));
        setUnreadCount(list.length > 3 ? 3 : list.length);
      } catch (err) {
        console.error('Failed to load header notification logs:', err);
      }
    }
    loadNotifications();
  }, [user]);

  const handleLangChange = (e) => {
    setLang(e.target.value);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 fixed top-0 right-0 left-0 lg:left-64 z-30 flex items-center justify-between px-6 no-print">
      
      {/* Mobile Toggle Button */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-school-primary" />
          <span className="font-extrabold text-lg text-slate-800 tracking-tight block lg:hidden font-sans">
            SmartSchool <span className="text-school-accent">LK</span>
          </span>
          <span className="text-sm font-semibold text-slate-500 hidden lg:block font-sans">
            {t('portalTitle')}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        
        {/* Language switcher drop menu */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Languages className="w-4 h-4 text-slate-500" />
          <select 
            value={lang} 
            onChange={handleLangChange}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer font-sans"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

        {/* Notifications Icon and drawer */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-school-danger text-[9px] font-extrabold text-white flex items-center justify-center rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-fade-in">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <span className="font-bold text-sm text-slate-800 font-sans">{t('inbox')}</span>
                <button 
                  onClick={() => setUnreadCount(0)}
                  className="text-xs text-school-primary font-semibold hover:underline font-sans"
                >
                  Mark read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-sans">
                    No new circulars or alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-slate-100 hover:bg-slate-50/80 transition-colors flex gap-3">
                      <div className={`p-2 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0 ${
                        n.message_type === 'emergency' 
                          ? 'bg-red-50 text-red-500' 
                          : n.message_type === 'absence' 
                            ? 'bg-amber-50 text-amber-500' 
                            : 'bg-blue-50 text-blue-500'
                      }`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                            {n.message_type} ({n.channel})
                          </span>
                          <span className="text-[9px] text-slate-400 font-sans">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 font-sans">{n.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-slate-200"></div>

        {/* User Card Profile Summary */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-school-primary text-white font-extrabold flex items-center justify-center shadow-sm select-none uppercase font-sans">
            {user?.profile?.name ? user.profile.name.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block">
            <h4 className="text-xs font-bold text-slate-800 font-sans leading-none mb-1">
              {user?.profile?.name || 'User Name'}
            </h4>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-sans">
              {user?.role}
            </span>
          </div>
          
          <button 
            onClick={logout}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-500 transition-colors"
            title={t('logout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
}
