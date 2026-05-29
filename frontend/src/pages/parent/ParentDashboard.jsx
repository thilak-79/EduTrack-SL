import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  Bell, 
  TrendingUp, 
  Smartphone,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ParentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingChild, setLoadingChild] = useState(false);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadParentConfig() {
      try {
        const kidList = await api.get('/parent/children');
        setChildren(kidList);
        
        // Fetch recent circulars
        const circulars = await api.get('/notices');
        setNotices(circulars.slice(0, 3));

        if (kidList.length > 0) {
          // Set first child active by default
          setSelectedChild(kidList[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load parent dashboard configuration.');
        setLoading(false);
      }
    }
    loadParentConfig();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild.id);
    }
  }, [selectedChild]);

  async function loadChildData(childId) {
    setLoadingChild(true);
    try {
      const attendance = await api.get(`/parent/attendance/${childId}`);
      const results = await api.get(`/parent/results/${childId}`);
      
      // Determine today's arrival status based on logs
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLog = attendance.logs?.find(l => l.date === todayStr);

      setDashboardData({
        attendance: attendance.summary,
        results: results.summaries,
        today_status: todayLog ? todayLog.status : null
      });
    } catch (err) {
      setError('Failed to fetch child progress registers.');
    } finally {
      setLoadingChild(false);
      setLoading(false);
    }
  }

  const handleChildSwitch = (e) => {
    const kid = children.find(c => c.id === parseInt(e.target.value));
    if (kid) setSelectedChild(kid);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Guardian Home...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Profile Switcher Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('welcome')}, {user?.profile?.name || 'Parent Portal'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor attendance logs, view report cards, and read circular dispatches
          </p>
        </div>

        {children.length > 1 && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Users className="w-4 h-4 text-slate-500" />
            <select 
              value={selectedChild?.id} 
              onChange={handleChildSwitch}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer font-sans"
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.class_name})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {selectedChild && dashboardData && (
        <div className="space-y-6">
          
          {/* Active Student Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Child Profile summary */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 bg-blue-50 text-school-primary rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  Student Profile
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 truncate mb-1">
                  {selectedChild.name}
                </h3>
                <span className="px-2 py-0.5 bg-blue-50 text-school-primary border border-blue-100 rounded-lg text-[9px] font-extrabold">
                  {selectedChild.class_name}
                </span>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 bg-emerald-50 text-school-success rounded-xl">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  {t('childAttendance')}
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 leading-none">
                  {dashboardData.attendance?.attendance_percentage || 0}%
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1 font-sans">
                  Total logs: {dashboardData.attendance?.total} days
                </span>
              </div>
            </div>

            {/* Arrival status today */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className={`p-3 rounded-xl ${
                dashboardData.today_status === 'Present' 
                  ? 'bg-emerald-50 text-school-success' 
                  : dashboardData.today_status === 'Absent' 
                    ? 'bg-red-50 text-school-danger' 
                    : dashboardData.today_status === 'Late'
                      ? 'bg-amber-50 text-school-warning'
                      : 'bg-slate-50 text-slate-400'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  {t('todayStatus')}
                </span>
                <h3 className={`text-sm font-extrabold uppercase leading-none ${
                  dashboardData.today_status === 'Present' 
                    ? 'text-school-success' 
                    : dashboardData.today_status === 'Absent' 
                      ? 'text-school-danger' 
                      : dashboardData.today_status === 'Late'
                        ? 'text-school-warning'
                        : 'text-slate-400'
                }`}>
                  {dashboardData.today_status || 'Not Marked Yet'}
                </h3>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Report card overview and quick routes */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Term test summaries */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                    Academic Summary (Term Test Averages)
                  </h3>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-3.5">
                  {Object.keys(dashboardData.results || {}).every(k => dashboardData.results[k] === null) ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No term results published online yet.
                    </p>
                  ) : (
                    Object.keys(dashboardData.results || {}).map((term) => {
                      const summary = dashboardData.results[term];
                      if (!summary) return null;
                      return (
                        <div key={term} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{term} Summary</span>
                            <h4 className="text-xs font-bold text-slate-800 mt-1">
                              Subjects: {summary.total_subjects} | Score: {summary.total_marks} Marks
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs font-extrabold text-school-primary font-mono">
                              Average: {summary.average}%
                            </span>
                            <span className="px-2 py-0.5 bg-blue-50 text-school-primary border border-blue-100 rounded-lg text-[9px] font-extrabold mt-1 inline-block">
                              GPA Grade: {summary.gpa_grade}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Roster History shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href={`/parent/attendance?student_id=${selectedChild.id}`} className="bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/10 p-5 rounded-2xl shadow-sm flex items-center justify-between group transition-all">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">Detailed Attendance History</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Roster checks & late arrivals logs</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-school-primary transition-colors" />
                </a>

                <a href={`/parent/results?student_id=${selectedChild.id}`} className="bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/10 p-5 rounded-2xl shadow-sm flex items-center justify-between group transition-all">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">Official Progress Report Card</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Subject-wise ranks & grades sheet</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-school-primary transition-colors" />
                </a>
              </div>

            </div>

            {/* notices circular board */}
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
                    <p className="text-xs text-slate-400 py-4 text-center">No recent school circulars.</p>
                  ) : (
                    notices.map((n) => (
                      <div key={n.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                          n.category === 'Emergency' ? 'text-red-600' : 'text-school-accent'
                        }`}>
                          {n.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{n.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <a href="/parent/messages" className="block text-center py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl transition-all mt-6">
                Open Message Inbox Drawer
              </a>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
