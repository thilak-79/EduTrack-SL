import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  BookOpen, 
  CalendarCheck, 
  FileSpreadsheet, 
  MessageSquare, 
  Loader2, 
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function TeacherDashboard() {
  const { t } = useLanguage();
  
  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const assigned = await api.get('/teacher/classes');
        const circulars = await api.get('/notices');
        setClasses(assigned);
        setNotices(circulars.slice(0, 3));
      } catch (err) {
        setError('Failed to load teacher dashboard components.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Teacher Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Faculty Home Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mark daily attendance logs, submit term test marks, and dispatch notifications to parents
          </p>
        </div>

        <div className="flex gap-2">
          <a href="/teacher/attendance" className="flex items-center gap-1.5 px-4 py-2.5 bg-school-primary hover:bg-school-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shadow-blue-50">
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </a>
          <a href="/teacher/results" className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl transition-all shadow-sm">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Enter Exam Marks</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Classes count */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 school-card-hover">
          <div className="p-3.5 bg-blue-50 text-school-primary rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Assigned Courses
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">{classes.length} Courses</h3>
          </div>
        </div>

        {/* Pending Attendance count */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 school-card-hover">
          <div className="p-3.5 bg-amber-50 text-school-warning rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Daily Attendance Marks
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">Roster Ready</h3>
          </div>
        </div>

        {/* Messaging logs stats */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 school-card-hover">
          <div className="p-3.5 bg-green-50 text-school-success rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Parent Dispatch Gateways
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">SMS Portal OK</h3>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assigned courses lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 tracking-tight mb-4">
              My Assigned Classes & Subjects
            </h3>

            {classes.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                No classes assigned to your profile. Please contact the administrator.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <div key={cls.mapping_id} className="p-5 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/10 rounded-2xl transition-all flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="px-2.5 py-1 bg-blue-50 text-school-primary rounded-lg font-bold text-[9px] uppercase tracking-wider">
                        {cls.class_name}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-800 tracking-tight mt-3">
                        {cls.subject_name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100/80 pt-4 mt-6">
                      <a href={`/teacher/attendance?class_id=${cls.class_id}&subject_id=${cls.subject_id}`} className="text-xs font-bold text-school-primary hover:underline flex items-center gap-1">
                        <span>Take Roll Call</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notices circulars board */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                {t('recentNotices')}
              </h3>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent circulars.</p>
              ) : (
                notices.map((n) => (
                  <div key={n.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <span className="text-[9px] font-bold text-school-accent uppercase tracking-wider block mb-1">
                      {n.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{n.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <a href="/admin/notices" className="block text-center py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl transition-all mt-6">
            View All Circulars
          </a>
        </div>

      </div>

    </div>
  );
}
