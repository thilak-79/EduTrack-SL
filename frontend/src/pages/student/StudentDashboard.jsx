import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  Bell, 
  Loader2, 
  ArrowRight,
  User,
  GraduationCap
} from 'lucide-react';

export default function StudentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [dashboard, setDashboard] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStudentData() {
      try {
        const studentData = await api.get('/student/dashboard');
        const circulars = await api.get('/notices');
        setDashboard(studentData);
        setNotices(circulars.slice(0, 3));
      } catch (err) {
        setError('Failed to load student dashboard info.');
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Student Portal...</span>
      </div>
    );
  }

  const profile = dashboard?.profile;
  const attendance = dashboard?.attendance;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {t('welcome')}, {profile?.name || 'Student'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Admission No: <span className="font-bold text-school-primary font-mono">{profile?.admission_no}</span> | Class: <span className="font-bold text-slate-700">{profile?.class_name}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 school-card-hover">
          <div className="p-3.5 bg-blue-50 text-school-primary rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              My Attendance Rate
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
              {attendance?.summary?.attendance_percentage || 100}%
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">
              Present: {attendance?.summary?.present} | Absent: {attendance?.summary?.absent}
            </span>
          </div>
        </div>

        {/* Assigned classroom */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 school-card-hover">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Current Roster Class
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
              {profile?.class_name}
            </h3>
          </div>
        </div>

        {/* Health / Medical summary */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 school-card-hover">
          <div className="p-3.5 bg-emerald-50 text-school-success rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Medical & Emergency Notes
            </span>
            <p className="text-xs text-slate-600 font-semibold truncate" title={profile?.medical_notes}>
              {profile?.medical_notes || 'No chronic health issues recorded.'}
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Attendance list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 tracking-tight mb-4">
              My Recent Attendance Logs
            </h3>

            {attendance?.recent_logs?.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                No attendance marks recorded in your registry yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Course / Session</th>
                      <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Arrival Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance?.recent_logs?.slice(0, 5).map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 text-xs font-bold text-slate-700 font-mono">{log.date}</td>
                        <td className="py-3 text-xs text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700">
                            {log.subject_name || 'Daily General Attendance'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[9px] border uppercase tracking-wider ${
                              log.status === 'Present' 
                                ? 'bg-emerald-50 border-emerald-100 text-school-success' 
                                : log.status === 'Absent' 
                                  ? 'bg-red-50 border-red-100 text-school-danger' 
                                  : 'bg-amber-50 border-amber-100 text-school-warning'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Notices Circulars board */}
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
                <p className="text-xs text-slate-400 py-4 text-center">No recent circular circulars.</p>
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

          <a href="/student/notices" className="block text-center py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl transition-all mt-6">
            View All Circular Bulletins
          </a>
        </div>

      </div>

    </div>
  );
}
