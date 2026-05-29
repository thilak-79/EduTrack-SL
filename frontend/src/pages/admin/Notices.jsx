import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Loader2, 
  Megaphone,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react';

export default function Notices() {
  const { t } = useLanguage();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Circular');
  const [targetAudience, setTargetAudience] = useState('All');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);

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
      setError('Failed to load notices circular feed.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !targetAudience || !date) {
      setError('Please fill in all circular details.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      title,
      description,
      category,
      target_audience: targetAudience,
      date
    };

    try {
      await api.post('/notices', payload);
      setSuccess('Notice circular published successfully on the board.');
      setTitle('');
      setDescription('');
      setCategory('Circular');
      setTargetAudience('All');
      setDate(new Date().toISOString().split('T')[0]);
      setShowAddForm(false);
      await loadNotices();
    } catch (err) {
      setError('Failed to publish notice.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this circular notice?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/notices/${id}`);
      setSuccess('Circular notice deleted successfully.');
      await loadNotices();
    } catch (err) {
      setError('Failed to delete notice.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Notices database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-school-primary" />
            <span>School Notice Board & Circulars</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Write official notices, circular statements, school sports meets, and exam schedule events
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1 bg-school-primary hover:bg-school-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md px-5 py-3 select-none transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
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

      {/* Write circular form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-school-primary" />
            <span>Draft Circular Circular Notice</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Circular Title (Required)</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End of Term Test Examination Dates"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Event Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer font-sans"
              >
                <option value="Circular">General Circular</option>
                <option value="Holiday">Holiday Announcement</option>
                <option value="Sports">Sports Meet / Extra-curricular</option>
                <option value="Exam">Exam Schedule</option>
                <option value="Meeting">Parent Meeting Date</option>
                <option value="Emergency">Emergency Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Target Audience Scope</label>
              <select 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer font-sans"
              >
                <option value="All">All Audiences (Teachers, Parents, Students)</option>
                <option value="Teachers">Academic Staff Only</option>
                <option value="Parents">Student Parents / Guardians Only</option>
                <option value="Students">Registered Students Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Publish Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Detailed Description Body</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete circular details, rules, timetables, and guidelines here..."
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
              required
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-school-primary text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              <span>Publish Circular</span>
            </button>
          </div>
        </form>
      )}

      {/* Notices Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-xs text-slate-400 font-sans md:col-span-2">
            No active notice board items found.
          </div>
        ) : (
          notices.map((n) => (
            <div key={n.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              
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
                  <span>Audience: {n.target_audience}</span>
                </span>

                <button 
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-school-danger rounded-lg text-slate-400 transition-colors shadow-sm"
                  title="Delete Circular"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
