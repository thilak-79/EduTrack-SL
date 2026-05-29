import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  BookOpen, 
  CalendarCheck, 
  FileSpreadsheet, 
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function Classes() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadConfig() {
      try {
        const mappings = await api.get('/teacher/classes');
        setClasses(mappings);
      } catch (err) {
        setError('Failed to fetch assigned classes.');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Assigned Classes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Title Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-school-primary" />
            <span>{t('assignedClasses')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of your classes and curriculum subjects assigned for active academic terms
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-xs text-slate-400 font-sans shadow-sm">
          No classes assigned to your profile. Please contact the administrator.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.mapping_id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              
              <div>
                <span className="px-2.5 py-1 bg-blue-50 text-school-primary rounded-lg font-bold text-[9px] uppercase tracking-wider">
                  {cls.class_name}
                </span>
                <h3 className="font-extrabold text-base text-slate-800 tracking-tight mt-4">
                  {cls.subject_name}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-school-success" />
                  <span>Authorized for Marksheets</span>
                </p>
              </div>

              <div className="border-t border-slate-100/80 pt-4 mt-8 flex flex-col gap-2.5">
                <a 
                  href={`/teacher/attendance?class_id=${cls.class_id}&subject_id=${cls.subject_id}`}
                  className="w-full py-2 bg-school-primary hover:bg-school-primary/95 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Take Attendance</span>
                </a>

                <a 
                  href={`/teacher/results?class_id=${cls.class_id}&subject_id=${cls.subject_id}`}
                  className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Enter Test Marks</span>
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
