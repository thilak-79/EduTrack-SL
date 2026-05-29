import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Loader2, 
  User, 
  GraduationCap,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Classes() {
  const { t } = useLanguage();
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Class Form Field
  const [newClassName, setNewClassName] = useState('');
  const [showAddClass, setShowAddClass] = useState(false);

  // Mapping Form Fields
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [savingMapping, setSavingMapping] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const classList = await api.get('/admin/classes');
      const teacherList = await api.get('/admin/teachers');
      const subjectList = await api.get('/admin/subjects');
      setClasses(classList);
      setTeachers(teacherList);
      setSubjects(subjectList);
    } catch (err) {
      setError('Failed to load classes and curriculum databases.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setError('');
    setSuccess('');
    try {
      await api.post('/admin/classes', { name: newClassName });
      setSuccess(`Class ${newClassName} successfully created.`);
      setNewClassName('');
      setShowAddClass(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create class.');
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) {
      setError('Please select class and subject.');
      return;
    }

    setSavingMapping(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/classes/assign-teacher', {
        class_id: parseInt(selectedClass),
        subject_id: parseInt(selectedSubject),
        teacher_id: selectedTeacher ? parseInt(selectedTeacher) : null
      });
      setSuccess('Curriculum assignment updated successfully.');
      setSelectedClass('');
      setSelectedSubject('');
      setSelectedTeacher('');
      await loadData();
    } catch (err) {
      setError('Failed to update curriculum mapping.');
    } finally {
      setSavingMapping(false);
    }
  };

  const handleRemoveMapping = async (mappingId) => {
    if (!window.confirm('Remove this subject from class syllabus?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/classes/subjects/${mappingId}`);
      setSuccess('Subject mapping removed.');
      await loadData();
    } catch (err) {
      setError('Failed to remove subject.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Class registries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-school-primary" />
            <span>Class syllabi & Teacher Assignments</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure student classes, register subjects taught, and allocate faculty teachers
          </p>
        </div>

        <button 
          onClick={() => setShowAddClass(!showAddClass)}
          className="flex items-center justify-center gap-1 bg-school-primary hover:bg-school-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md px-5 py-3 select-none transition-all hover:scale-[1.02]"
        >
          <Building className="w-4 h-4" />
          <span>Create New Class</span>
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

      {/* Conditional Create Class input */}
      {showAddClass && (
        <form onSubmit={handleCreateClass} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-end gap-4 max-w-md animate-fade-in">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Classroom Name</label>
            <input 
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Grade 11C"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
              required
            />
          </div>
          <button 
            type="submit"
            className="px-4 py-2.5 bg-school-primary text-white text-xs font-extrabold rounded-xl shadow-sm"
          >
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: syllabus assignments form */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-school-accent" />
            <span>Map Teacher to Syllabus</span>
          </h3>

          <form onSubmit={handleAssignTeacher} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Select Class (Required)</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
                required
              >
                <option value="">Select Class...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Select Subject (Required)</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
                required
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-sans">Select Assignee Teacher</label>
              <select 
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary transition-all font-sans"
              >
                <option value="">Unassigned (No Teacher)</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              disabled={savingMapping}
              className="w-full py-2.5 bg-school-primary hover:bg-school-primary/95 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 font-sans"
            >
              {savingMapping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Assignment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Active Class syllabus lists */}
        <div className="lg:col-span-2 space-y-4">
          
          {classes.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-xs text-slate-400 font-sans">
              No classrooms created yet.
            </div>
          ) : (
            classes.map((cls) => (
              <div key={cls.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">{cls.name}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Roster: {cls.student_count || 0} Students enrolled
                    </p>
                  </div>
                </div>

                {/* Subject grids */}
                <div className="p-5">
                  {cls.subjects?.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No subject courses assigned to this classroom syllabus yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cls.subjects?.map((sub) => (
                        <div key={sub.mapping_id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-slate-800 truncate">{sub.subject_name}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                              <User className="w-3 h-3" />
                              <span>{sub.teacher_name || 'No Teacher Assigned'}</span>
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveMapping(sub.mapping_id)}
                            className="p-1 hover:bg-red-50 hover:text-school-danger rounded-lg text-slate-400 transition-colors ml-2"
                            title="Remove Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}
