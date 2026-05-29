import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  CalendarCheck, 
  Search, 
  Loader2, 
  CheckCircle,
  AlertOctagon,
  Clock,
  ArrowLeft,
  Users
} from 'lucide-react';

export default function Attendance() {
  const { t } = useLanguage();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const queryStudentId = queryParams.get('student_id');

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadConfig() {
      try {
        const kidList = await api.get('/parent/children');
        setChildren(kidList);
        
        if (kidList.length > 0) {
          // If student_id parameter is present, select that child, else default to first
          const matched = queryStudentId 
            ? kidList.find(c => c.id === parseInt(queryStudentId))
            : null;
          setSelectedChild(matched || kidList[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load child list.');
        setLoading(false);
      }
    }
    loadConfig();
  }, [queryStudentId]);

  useEffect(() => {
    if (selectedChild) {
      loadLogs(selectedChild.id);
    }
  }, [selectedChild]);

  async function loadLogs(childId) {
    setLoadingLogs(true);
    setError('');
    try {
      const data = await api.get(`/parent/attendance/${childId}`);
      setLogs(data.logs || []);
      setSummary(data.summary);
    } catch (err) {
      setError('Failed to fetch child attendance registers.');
    } finally {
      setLoadingLogs(false);
      setLoading(false);
    }
  }

  const handleChildSwitch = (e) => {
    const kid = children.find(c => c.id === parseInt(e.target.value));
    if (kid) setSelectedChild(kid);
  };

  const filteredLogs = logs.filter(l => {
    const dateStr = l.date || '';
    const subject = l.subject_name || 'Daily General Attendance';
    const matchesSearch = dateStr.includes(searchQuery) || subject.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesStatus = statusFilter === '' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Child Attendance Directories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 no-print transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-school-primary" />
              <span>{t('childAttendance')} ({selectedChild?.name})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily arrival history logs, subject-wise check-ins, and late arrivals
            </p>
          </div>
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

      {selectedChild && summary && (
        <div className="space-y-6">
          
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Percentage */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
              <div className="p-3 bg-blue-50 rounded-xl text-school-primary">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  Roster Percentage
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
                  {summary.attendance_percentage}%
                </h3>
              </div>
            </div>

            {/* Present days */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
              <div className="p-3 bg-emerald-50 rounded-xl text-school-success">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  Present Days
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
                  {summary.present} Days
                </h3>
              </div>
            </div>

            {/* Late days */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
              <div className="p-3 bg-amber-50 rounded-xl text-school-warning">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  Late Arrivals
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
                  {summary.late} Days
                </h3>
              </div>
            </div>

            {/* Absent days */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
              <div className="p-3 bg-red-50 rounded-xl text-school-danger">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                  Absent Days
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 leading-none">
                  {summary.absent} Days
                </h3>
              </div>
            </div>

          </div>

          {/* Detailed logs table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Table controls */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between no-print">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by date or subject..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
                />
              </div>

              <div className="flex w-full sm:w-auto items-center gap-3">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-40 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer font-sans"
                >
                  <option value="">Roster Status (All)</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loadingLogs ? (
                <div className="p-12 text-center text-xs text-slate-400 font-sans">
                  <Loader2 className="w-6 h-6 animate-spin text-school-primary mx-auto mb-2" />
                  <span>Loading child registers...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 font-semibold font-sans">
                  No attendance records found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/20">
                      <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Course / Session</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Conducting Teacher</th>
                      <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((l) => (
                      <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                        <td className="py-4 px-6 text-xs font-bold text-slate-800 font-mono">{l.date}</td>
                        <td className="py-4 px-6 text-xs text-slate-600">
                          <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg font-bold text-[10px] text-slate-700">
                            {l.subject_name || 'Daily General Attendance'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-semibold">{l.teacher_name || 'Class Teacher'}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] text-center border uppercase tracking-wider ${
                              l.status === 'Present' 
                                ? 'bg-emerald-50 border-emerald-200 text-school-success' 
                                : l.status === 'Absent' 
                                  ? 'bg-red-50 border-red-200 text-school-danger' 
                                  : 'bg-amber-50 border-amber-200 text-school-warning'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
