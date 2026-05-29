import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  CalendarCheck, 
  Search, 
  Loader2, 
  CheckCircle, 
  Info,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

export default function Attendance() {
  const { t } = useLanguage();
  const location = useLocation();

  // Load routing query parameters if redirected from course cards
  const queryParams = new URLSearchParams(location.search);
  const initialClass = queryParams.get('class_id') || '';
  const initialSubject = queryParams.get('subject_id') || '';

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConfigurations();
  }, []);

  // Reload roster when parameters change
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadRoster();
    } else {
      setRoster([]);
    }
  }, [selectedClass, selectedSubject, selectedDate]);

  async function loadConfigurations() {
    setLoadingConfig(true);
    try {
      // Teachers retrieve assigned classes
      const mappings = await api.get('/teacher/classes');
      setClasses(mappings);
      
      // Deduplicate subjects
      const subMap = {};
      mappings.forEach(m => {
        subMap[m.subject_id] = m.subject_name;
      });
      setSubjects(Object.keys(subMap).map(id => ({ id, name: subMap[id] })));
    } catch (err) {
      setError('Failed to load teacher class directories.');
    } finally {
      setLoadingConfig(false);
    }
  }

  async function loadRoster() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const url = `/teacher/attendance?class_id=${selectedClass}&date=${selectedDate}${selectedSubject ? `&subject_id=${selectedSubject}` : ''}`;
      const data = await api.get(url);
      setRoster(data);
    } catch (err) {
      setError('Failed to fetch class roster attendance sheet.');
    } finally {
      setLoading(false);
    }
  }

  // Local radio toggle
  const handleStatusChange = (studentId, newStatus) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const handleMarkAllPresent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedDate) {
      setError('Please choose class and date.');
      return;
    }

    // Check if any students aren't marked
    const unmarked = roster.some(s => !s.status);
    if (unmarked) {
      if (!window.confirm('Some students are unmarked. Do you want to submit anyway?')) return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const records = roster
      .filter(s => s.status)
      .map(s => ({ student_id: s.id, status: s.status }));

    try {
      await api.post('/teacher/attendance', {
        class_id: parseInt(selectedClass),
        subject_id: selectedSubject ? parseInt(selectedSubject) : null,
        date: selectedDate,
        records
      });
      setSuccess('Attendance sheet successfully submitted.');
      await loadRoster();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to submit attendance roster.');
    } finally {
      setSaving(false);
    }
  };

  const filteredRoster = roster.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    s.admission_no.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (loadingConfig) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Class Directories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-school-primary" />
            <span>Mark Student Roster Attendance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mark daily general present logs or subject-wise rosters. SMS alerts sent automatically for absences.
          </p>
        </div>

        {roster.length > 0 && (
          <button 
            onClick={handleMarkAllPresent}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-emerald-50 text-slate-700 hover:text-school-success font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Mark All as Present
          </button>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border-l-4 border-school-success rounded-r-xl text-xs font-semibold text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Roster Controls */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Roster Date</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Assign Class (Required)</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
            >
              <option value="">Select Class...</option>
              {classes.map(c => (
                <option key={c.mapping_id} value={c.class_id}>
                  {c.class_name} ({c.subject_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Course Subject (Optional)</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
            >
              <option value="">Daily General Attendance</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Roster list */}
      {selectedClass && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name or admission no..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3.5 py-2 rounded-xl text-[10px] font-bold border border-amber-100">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{t('absenceNotifAuto')}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 font-sans">
                <Loader2 className="w-6 h-6 animate-spin text-school-primary mx-auto mb-2" />
                <span>Loading class roster registers...</span>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-semibold font-sans">
                No students enrolled in class registry.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Admission No</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Status Control</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                      <td className="py-4 px-6 text-xs font-bold text-slate-500 font-mono">{s.admission_no}</td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-800">{s.name}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-2">
                          
                          {/* Present */}
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl cursor-pointer text-xs font-semibold transition-all select-none ${
                            s.status === 'Present'
                              ? 'bg-emerald-50 border-emerald-300 text-school-success shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}>
                            <input 
                              type="radio" 
                              name={`attendance-${s.id}`}
                              checked={s.status === 'Present'}
                              onChange={() => handleStatusChange(s.id, 'Present')}
                              className="hidden"
                            />
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{t('present')}</span>
                          </label>

                          {/* Absent */}
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl cursor-pointer text-xs font-semibold transition-all select-none ${
                            s.status === 'Absent'
                              ? 'bg-red-50 border-red-300 text-school-danger shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}>
                            <input 
                              type="radio" 
                              name={`attendance-${s.id}`}
                              checked={s.status === 'Absent'}
                              onChange={() => handleStatusChange(s.id, 'Absent')}
                              className="hidden"
                            />
                            <UserX className="w-3.5 h-3.5" />
                            <span>{t('absent')}</span>
                          </label>

                          {/* Late */}
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl cursor-pointer text-xs font-semibold transition-all select-none ${
                            s.status === 'Late'
                              ? 'bg-amber-50 border-amber-300 text-school-warning shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}>
                            <input 
                              type="radio" 
                              name={`attendance-${s.id}`}
                              checked={s.status === 'Late'}
                              onChange={() => handleStatusChange(s.id, 'Late')}
                              className="hidden"
                            />
                            <Clock className="w-3.5 h-3.5" />
                            <span>{t('late')}</span>
                          </label>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Save button footer */}
          {!loading && roster.length > 0 && (
            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-school-primary hover:bg-school-primary/95 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shadow-blue-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Roster Ranks...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Save Attendance Log</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
