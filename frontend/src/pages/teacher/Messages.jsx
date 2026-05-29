import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  CheckCircle,
  Users,
  Smartphone,
  Mail,
  History
} from 'lucide-react';

export default function Messages() {
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [messageType, setMessageType] = useState('meeting');
  const [channel, setChannel] = useState('SMS');
  const [content, setContent] = useState('');
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConfig();
    loadHistory();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  async function loadConfig() {
    try {
      const assigned = await api.get('/teacher/classes');
      setClasses(assigned);
    } catch (err) {
      setError('Failed to load class configs.');
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const list = await api.get('/messages/history');
      setHistory(list);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStudents() {
    try {
      const list = await api.get(`/teacher/attendance?class_id=${selectedClass}&date=${new Date().toISOString().split('T')[0]}`);
      setStudents(list);
    } catch (err) {
      setError('Failed to load class roster.');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !content.trim()) {
      setError('Please select student and write message content.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/teacher/messages', {
        student_id: parseInt(selectedStudent),
        message_type: messageType,
        channel,
        content
      });
      setSuccess('Parent notified successfully.');
      setContent('');
      setSelectedStudent('');
      setSelectedClass('');
      await loadHistory();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to dispatch message.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Messaging Directories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-school-primary" />
            <span>Notify & Message Guardians</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Send custom circular updates, late arrival notes, parent-teacher meeting invitations via SMS/Email
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: message sender form */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-school-accent" />
            <span>Draft Parent Alert</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Select Student Class</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all"
                required
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Select Student (Guardian link)</label>
              <select 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all"
                required
                disabled={!selectedClass}
              >
                <option value="">Choose student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.admission_no})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Message Category</label>
              <select 
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
              >
                <option value="meeting">Parent-Teacher Meeting</option>
                <option value="general">General Circular Note</option>
                <option value="absence">Roster Absence Query</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Dispatch Channel Gateway</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                    channel === 'SMS' 
                      ? 'bg-blue-50 border-blue-300 text-school-primary shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS API</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setChannel('Email')}
                  className={`flex-1 py-2 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                    channel === 'Email' 
                      ? 'bg-blue-50 border-blue-300 text-school-primary shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Server</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Message Content Body</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="E.g., Dear Parent, you are cordially invited to the Term 1 review meeting on Friday at 8 AM in the assembly hall."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all"
                required
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-school-primary hover:bg-school-primary/95 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 font-sans"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Notify Guardian</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Sent History Log */}
        <div className="lg:col-span-2 space-y-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Sent Messages Audit Trail</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-6 text-center">No messages sent in this session.</p>
            ) : (
              history.map((h) => (
                <div key={h.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-school-primary rounded-lg flex-shrink-0">
                    {h.channel === 'SMS' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {h.message_type} alert ({h.student_name ? `Concerning: ${h.student_name}` : 'General Broadcast'})
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-school-success border border-emerald-100 rounded-lg text-[9px] font-extrabold font-mono capitalize">
                        {h.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">{h.content}</p>
                    <span className="block text-[9px] text-slate-400 mt-2 font-mono">
                      Sent to: {h.receiver_email} on {new Date(h.created_at).toLocaleDateString()} at {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
