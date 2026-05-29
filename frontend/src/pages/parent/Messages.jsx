import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  MessageSquare, 
  Loader2, 
  Smartphone, 
  Mail, 
  Inbox,
  CalendarCheck,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function Messages() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInbox() {
      try {
        const inbox = await api.get('/parent/messages');
        setMessages(inbox);
      } catch (err) {
        setError('Failed to fetch parent inbox logs.');
      } finally {
        setLoading(false);
      }
    }
    loadInbox();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Message Drawer...</span>
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
            <span>School Communication Inbox</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View administrative emergency announcements, meeting invitations, and attendance notifications
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Inbox List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-xs text-slate-400 font-sans shadow-sm flex flex-col items-center justify-center gap-2">
            <Inbox className="w-8 h-8 text-slate-300" />
            <span className="font-semibold">Your circular inbox drawer is empty.</span>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              {/* Channel badge */}
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                m.message_type === 'emergency' 
                  ? 'bg-red-50 text-red-600' 
                  : m.message_type === 'absence' 
                    ? 'bg-amber-50 text-amber-600' 
                    : 'bg-blue-50 text-school-primary'
              }`}>
                {m.channel === 'SMS' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                    m.message_type === 'emergency' 
                      ? 'text-red-600' 
                      : m.message_type === 'absence' 
                        ? 'text-amber-600' 
                        : 'text-school-accent'
                  }`}>
                    {m.message_type} alert ({m.channel})
                  </span>
                  
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(m.created_at).toLocaleDateString()} at {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {m.student_name && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 mb-2">
                    <UserCheck className="w-3 h-3" />
                    <span>Student: {m.student_name}</span>
                  </span>
                )}

                <p className="text-xs text-slate-600 leading-relaxed font-light whitespace-pre-line">
                  {m.content}
                </p>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100/50">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Sender: {m.sender_name || 'School Principal'}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-school-success border border-emerald-100 rounded-lg text-[9px] font-extrabold font-mono">
                    Received
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
