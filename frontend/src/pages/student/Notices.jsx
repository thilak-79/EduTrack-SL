import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  Bell, 
  Loader2, 
  Calendar,
  Users
} from 'lucide-react';

export default function Notices() {
  const { t } = useLanguage();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/notices');
      setNotices(data);
    } catch (err) {
      setError('Failed to load school notice board.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Notices board...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Title Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-school-primary" />
          <span>School Notices & Bulletins</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Read official circulars, sports matches updates, and holiday events schedules
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Notices Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-xs text-slate-400 font-sans md:col-span-2 shadow-sm">
            No active notice bulletins published today.
          </div>
        ) : (
          notices.map((n) => (
            <div key={n.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
              
              {/* Category tags */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider ${
                  n.category === 'Emergency' 
                    ? 'bg-red-50 text-red-600' 
                    : n.category === 'Exam' 
                      ? 'bg-amber-50 text-amber-600' 
                      : n.category === 'Meeting'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-blue-50 text-school-primary'
                }`}>
                  {n.category}
                </span>

                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{n.date}</span>
                </span>
              </div>

              {/* Notice content */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 leading-snug tracking-tight mb-2">
                  {n.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line mb-6 font-light">
                  {n.description}
                </p>
              </div>

              {/* Target info and delete */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center bg-slate-50/20 px-1 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <Users className="w-3.5 h-3.5" />
                  <span>Audience: Registered Students</span>
                </span>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
