import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  Calendar,
  Contact, 
  Info,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function Students() {
  const { t } = useLanguage();
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Roster Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // Roster Form Fields
  const [admissionNo, setAdmissionNo] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [classId, setClassId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  
  // Guardian Fields
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  
  // Credentials
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const studentList = await api.get('/admin/students');
      const classList = await api.get('/admin/classes');
      setStudents(studentList);
      setClasses(classList);
    } catch (err) {
      setError('Failed to load student registry databases.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setAdmissionNo('');
    setName('');
    setDob('');
    setClassId('');
    setMedicalNotes('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setParentAddress('');
    setStudentEmail('');
    setStudentPassword('');
    setParentPassword('');
    setShowModal(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setAdmissionNo(student.admission_no);
    setName(student.name);
    setDob(student.dob);
    setClassId(student.class_id || '');
    setMedicalNotes(student.medical_notes || '');
    setParentName(student.parent_name || '');
    setParentPhone(student.parent_phone || '');
    setParentEmail(student.parent_email || '');
    setParentAddress(student.parent_address || '');
    // Reset passwords and email for editing (emails will sync)
    setStudentEmail(student.student_email || '');
    setStudentPassword('');
    setParentPassword('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!admissionNo || !name || !dob || !classId || !parentName || !parentPhone || !parentEmail || (!editingStudent && !studentEmail)) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      admission_no: admissionNo,
      name,
      dob,
      class_id: parseInt(classId),
      medical_notes: medicalNotes,
      parent_name: parentName,
      parent_phone: parentPhone,
      parent_email: parentEmail,
      parent_address: parentAddress,
      student_email: studentEmail,
      student_password: studentPassword || 'Student123',
      parent_password: parentPassword || 'Parent123'
    };

    try {
      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, payload);
        setSuccess('Student profile and guardian contacts updated successfully.');
      } else {
        await api.post('/admin/students', payload);
        setSuccess('Student successfully registered and login credentials generated.');
      }
      setShowModal(false);
      await loadData();
      // Clear alerts after 4s
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save student profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/students/${id}`);
      setSuccess('Student record deleted successfully.');
      await loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to delete student.');
    }
  };

  // Filter roster
  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = s.name.toLowerCase().includes(query) || s.admission_no.toLowerCase().includes(query);
    const matchesClass = classFilter === '' || s.class_id === parseInt(classFilter);
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Student Registry Databases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-school-primary" />
            <span>Student Registry Admissions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new students, assign classes, and link legal guardians and parent phone lines
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-school-primary hover:bg-school-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-100 select-none transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
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
        
        {/* Roster Filters */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or admission no..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full md:w-44 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer font-sans"
            >
              <option value="">{t('filterClass')} (All)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 font-semibold font-sans">
              No student admissions found matching search parameters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20">
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Admission No</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Guardian</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Parent Phone</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Medical Note</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-xs font-bold text-school-primary font-mono">{s.admission_no}</td>
                    <td className="py-4 px-6">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-none mb-1">{s.name}</p>
                        <span className="text-[10px] text-slate-400 font-medium font-sans">DOB: {s.dob}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-blue-50 text-school-primary rounded-lg font-bold text-[10px] font-sans">
                        {s.class_name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-semibold">{s.parent_name || 'N/A'}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">{s.parent_phone || 'N/A'}</td>
                    <td className="py-4 px-6 text-xs text-slate-400 max-w-xs truncate" title={s.medical_notes}>
                      {s.medical_notes || 'None'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEditModal(s)}
                        className="inline-flex p-1.5 hover:bg-blue-50 hover:text-school-primary rounded-lg text-slate-400 transition-colors"
                        title={t('edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
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

      {/* Add / Edit Student Overlay Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl animate-fade-in overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-school-primary" />
                <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                  {editingStudent ? 'Edit Student Profile' : 'Register New Student Admission'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
              
              {/* SECTION 1: Student registry data */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Academic Registry Details</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Admission Number (Required)</label>
                    <input 
                      type="text"
                      value={admissionNo}
                      onChange={(e) => setAdmissionNo(e.target.value)}
                      placeholder="e.g. ADM-2026-105"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Student Full Name (Required)</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kamal Perera"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Date of Birth (Required)</label>
                    <input 
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Assign Class (Required)</label>
                    <select 
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                      required
                    >
                      <option value="">Choose Class...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Medical / Chronic Allergies Notes</label>
                  <textarea 
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    placeholder="E.g., Mild asthma, carries inhaler. Penicillin allergy. Wears prescription glasses."
                    rows={2}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                  ></textarea>
                </div>
              </div>

              {/* SECTION 2: Guardian/Parent data */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Contact className="w-3.5 h-3.5" />
                  <span>Guardian / Parent Contacts (Absence Alert Receiver)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Guardian Name (Required)</label>
                    <input 
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Mr. Jayalath Perera"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Guardian Phone (SMS Receiver - Required)</label>
                    <input 
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Guardian Email (Logins & Circulars - Required)</label>
                    <input 
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="e.g. parent.kamal@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Home Address</label>
                    <input 
                      type="text"
                      value={parentAddress}
                      onChange={(e) => setParentAddress(e.target.value)}
                      placeholder="No. 45, Flower Road, Colombo 03"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Login Accounts Credentials Setup */}
              {!editingStudent && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Credentials setup (Auto Login Portals Setup)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Student Login Email Address</label>
                      <input 
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="student.name@smartschool.lk"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
                        required={!editingStudent}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Student Password</label>
                      <input 
                        type="password"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="Default: Student123"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Guardian Password</label>
                      <input 
                        type="password"
                        value={parentPassword}
                        onChange={(e) => setParentPassword(e.target.value)}
                        placeholder="Default: Parent123"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

            </form>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                {t('cancel')}
              </button>
              
              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-school-primary hover:bg-school-primary/95 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving registry...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{editingStudent ? 'Update Profile' : 'Complete Admission'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
