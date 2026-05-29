import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  ShieldAlert, 
  Send, 
  Loader2, 
  CheckCircle,
  Smartphone,
  Mail,
  History,
  Inbox
} from 'lucide-react';

export default function EmergencyAlerts() {
  const { t } = useLanguage();

  const [content, setContent] = useState('');
  const [history, setHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const list = await api.get('/messages/history');
      // Filter only emergency dispatches
      const emergencies = list.filter(m => m.message_type === 'emergency');
      setHistory(emergencies);
    } catch (err) {
      setError('Failed to load emergency dispatches audit trail.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write message content to broadcast.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/emergency-alert', { content });
      setSuccess('Emergency alert broadcasted successfully to all parent phone lines and email addresses.');
      setContent('');
      await loadHistory();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to dispatch emergency broadcast.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Emergency Services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Title Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-school-danger" />
            <span>Emergency Broadcast Alert Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Blast real-time emergency notices to all legal guardians via mock SMS and email channels
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
        
        {/* LEFT COLUMN: alert form */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-extrabold text-sm text-red-700 tracking-tight mb-4 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-school-danger" />
            <span>Launch Broadcast Notice</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 font-sans">
                {t('enterAlertContent')}
              </label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="E.g., Due to severe weather warnings in Colombo district, school will be closed tomorrow. Examinations are postponed until further notice."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all font-sans"
                required
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-school-danger hover:bg-red-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 font-sans"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{t('sendAlert')}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Sent History Log */}
        <div className="lg:col-span-2 space-y-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Emergency Dispatch History logs</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-sans shadow-sm flex flex-col items-center justify-center gap-2">
                <Inbox className="w-8 h-8 text-slate-300" />
                <span className="font-semibold">No emergency dispatches broadcasted in this session.</span>
              </div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="p-4 bg-red-50/30 border border-red-100 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-red-100 text-school-danger rounded-lg flex-shrink-0">
                    {h.channel === 'SMS' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                        {h.channel} Dispatch Broadcast
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-school-success border border-emerald-100 rounded-lg text-[9px] font-extrabold font-mono capitalize">
                        {h.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-light">{h.content}</p>
                    <span className="block text-[9px] text-slate-400 mt-2 font-mono">
                      Broadcasted to all parents on {new Date(h.created_at).toLocaleDateString()} at {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
