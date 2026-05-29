import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';

export default function Teachers() {
  const { t } = useLanguage();
  
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Roster Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  // Teacher Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/teachers');
      setTeachers(data);
    } catch (err) {
      setError('Failed to load teacher registry database.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setShowModal(true);
  };

  const handleOpenEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name);
    setPhone(teacher.phone);
    setEmail(teacher.email);
    setPassword('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      setError('Please fill in name, phone, and email.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      name,
      phone,
      email,
      password: password || 'Teacher123'
    };

    try {
      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher.id}`, payload);
        setSuccess('Teacher details updated successfully.');
      } else {
        await api.post('/admin/teachers', payload);
        setSuccess('Teacher successfully registered and credential logins dispatched.');
      }
      setShowModal(false);
      await loadTeachers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save teacher profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/teachers/${id}`);
      setSuccess('Teacher record deleted successfully.');
      await loadTeachers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to delete teacher.');
    }
  };

  // Filter roster
  const filteredTeachers = teachers.filter(t => {
    const query = searchQuery.toLowerCase().trim();
    return t.name.toLowerCase().includes(query) || t.email.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Teacher Registry Database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-school-primary" />
            <span>Academic Faculty Registries</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add teachers, define phone channels, and create system login passwords
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-school-primary hover:bg-school-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-100 select-none transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Teacher</span>
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

      {/* Roster Controls and Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Roster Search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
            />
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          {filteredTeachers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold font-sans">
              No academic staff found matching search parameters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20">
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Teacher Name</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Directory</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Login Email</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Created At</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((tVal) => (
                  <tr key={tVal.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center font-sans">
                          {tVal.name.charAt(0)}
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-none">{tVal.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tVal.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tVal.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(tVal.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEditModal(tVal)}
                        className="inline-flex p-1.5 hover:bg-blue-50 hover:text-school-primary rounded-lg text-slate-400 transition-colors"
                        title={t('edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tVal.id)}
                        className="inline-flex p-1.5 hover:bg-red-50 hover:text-school-danger rounded-lg text-slate-400 transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Add / Edit Teacher Overlay Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-school-primary" />
                <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                  {editingTeacher ? 'Edit Teacher Details' : 'Register New Faculty'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Full Name (Required)</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mr. Sunil Perera"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Phone Number (Required)</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Login Email Address (Required)</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@smartschool.lk"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              {!editingTeacher && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Account Login Password</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Default: Teacher123"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                  />
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                  💡 **Notice:** Registered teachers can be assigned to classes and subjects inside the "Classes & Subjects" panel.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  {t('cancel')}
                </button>
                
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-school-primary hover:bg-school-primary/95 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{editingTeacher ? 'Save Changes' : 'Register Faculty'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
