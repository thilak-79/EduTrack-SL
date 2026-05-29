import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  AlertOctagon, 
  Bell, 
  TrendingUp, 
  Phone,
  ShieldAlert,
  Loader2,
  CheckCircle,
  Megaphone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Emergency modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [alertSending, setAlertSending] = useState(false);
  const [alertResult, setAlertResult] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        setError('Failed to load administrative analytics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    if (!alertContent.trim()) return;

    setAlertSending(true);
    setAlertResult(null);
    try {
      const result = await api.post('/admin/emergency-alert', { content: alertContent });
      setAlertResult(result);
      setAlertContent('');
      // Reload stats to update notice count/absent lists
      const freshStats = await api.get('/admin/stats');
      setStats(freshStats);
    } catch (err) {
      setError('Failed to broadcast emergency message.');
    } finally {
      setAlertSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Administration Panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('welcome')}, Admin Portal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of school activities, registry counts, and parent messaging channels
          </p>
        </div>
        
        {/* Emergency Alert Dispatcher Trigger */}
        <button 
          onClick={() => {
            setShowAlertModal(true);
            setAlertResult(null);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-school-danger hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-100 hover:shadow-red-200 select-none transition-all hover:scale-[1.02]"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{t('emergencyAlertButton')}</span>
        </button>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Students */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
          <div className="p-3 bg-blue-50 rounded-xl text-school-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              {t('totalStudents')}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
              {stats?.total_students || 0}
            </h3>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
          <div className="p-3 bg-emerald-50 rounded-xl text-school-success">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              {t('totalTeachers')}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
              {stats?.total_teachers || 0}
            </h3>
          </div>
        </div>

        {/* Today's Attendance rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
          <div className="p-3 bg-blue-50 rounded-xl text-school-accent">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              {t('attendanceRate')}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
              {stats?.attendance_percentage || 0}%
            </h3>
          </div>
        </div>

        {/* Absent Today count */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
          <div className="p-3 bg-red-50 rounded-xl text-school-danger">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              {t('absentCount')}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
              {stats?.absent_today_count || 0}
            </h3>
          </div>
        </div>

      </div>

      {/* Analytics chart and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Trends Bar Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                {t('weeklyAttendanceTrend')}
              </h3>
              <p className="text-[10px] text-slate-400">Class present/late log rate logs</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weekly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[80, 100]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="attendance" fill="#1e40af" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notices Count summary */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                {t('quickActions')}
              </h3>
              <Megaphone className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Instant shortcuts to common school digital registry setups:
            </p>
          </div>

          <div className="space-y-3">
            <a href="/admin/students" className="block w-full text-center py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl transition-all">
              Manage Student Registry
            </a>
            <a href="/admin/teachers" className="block w-full text-center py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl transition-all">
              Manage Academic Faculty
            </a>
            <a href="/admin/classes" className="block w-full text-center py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl transition-all">
              Configure Classes & Timetables
            </a>
            <a href="/admin/notices" className="block w-full text-center py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl transition-all">
              Publish Circular Updates
            </a>
          </div>
        </div>

      </div>

      {/* Today's Absence Roster Alerts */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
              Today's Absence Roster Audit (Parent Call logs)
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Parents of these students have been auto-notified via mock SMS alerts. Hotline available for emergency follow-up.
            </p>
          </div>
          <AlertOctagon className="w-5 h-5 text-school-danger" />
        </div>

        <div className="overflow-x-auto">
          {stats?.absent_students_list?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-semibold">
              🎉 Outstanding! No student absences registered today.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Parent/Guardian</th>
                  <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Parent Phone</th>
                  <th className="py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Emergency Call</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.absent_students_list || [
                  { student_name: 'Nimal Perera', class_name: 'Grade 10A', parent_name: 'Mr. Jayalath Perera', parent_phone: '0722334455' }
                ]).map((record, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 text-xs font-bold text-slate-800">{record.student_name}</td>
                    <td className="py-3 text-xs text-slate-600">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg font-bold text-[10px]">
                        {record.class_name}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-600">{record.parent_name}</td>
                    <td className="py-3 text-xs text-slate-500 font-mono">{record.parent_phone}</td>
                    <td className="py-3 text-right">
                      <a href={`tel:${record.parent_phone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-blue-50 text-slate-700 hover:text-school-primary rounded-lg text-xs font-bold transition-all shadow-sm">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Guardian</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Emergency alert broadcast modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50 text-red-700">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  CRITICAL EMERGENCY SYSTEM BROADCAST
                </h3>
              </div>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="text-red-700/60 hover:text-red-700 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="p-6 space-y-4">
              {alertResult ? (
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-8 h-8 text-school-success mx-auto animate-fade-in" />
                  <h4 className="font-extrabold text-xs text-slate-800">
                    Emergency Circular Dispatched Successfully!
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Alert successfully broadcasted to all parent phones via SMS ({alertResult.dispatches?.sms_sent} logs) and emails ({alertResult.dispatches?.emails_sent} logs).
                  </p>
                  <button 
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 bg-school-success hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('enterAlertContent')}
                  </p>
                  
                  <textarea 
                    value={alertContent}
                    onChange={(e) => setAlertContent(e.target.value)}
                    rows={4}
                    placeholder={t('alertPlaceholder')}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all font-sans"
                    required
                  ></textarea>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setShowAlertModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      {t('cancel')}
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={alertSending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-school-danger hover:bg-red-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                    >
                      {alertSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Alerts...</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{t('sendAlert')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
