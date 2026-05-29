import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  FileSpreadsheet, 
  Search, 
  Loader2, 
  CheckCircle,
  FileCheck,
  Percent,
  ListOrdered
} from 'lucide-react';

export default function Results() {
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  
  const [marksheet, setMarksheet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConfigurations();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm) {
      loadMarksheet();
    } else {
      setMarksheet([]);
    }
  }, [selectedClass, selectedSubject, selectedTerm]);

  async function loadConfigurations() {
    setLoadingConfig(true);
    try {
      const mappings = await api.get('/teacher/classes');
      setClasses(mappings);
      
      // Deduplicate subjects
      const subMap = {};
      mappings.forEach(m => {
        subMap[m.subject_id] = m.subject_name;
      });
      setSubjects(Object.keys(subMap).map(id => ({ id, name: subMap[id] })));
    } catch (err) {
      setError('Failed to load teacher syllabus configurations.');
    } finally {
      setLoadingConfig(false);
    }
  }

  async function loadMarksheet() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const url = `/teacher/results?class_id=${selectedClass}&subject_id=${selectedSubject}&exam_term=${selectedTerm}`;
      const data = await api.get(url);
      setMarksheet(data);
    } catch (err) {
      setError('Failed to fetch class marksheet.');
    } finally {
      setLoading(false);
    }
  }

  // Grade calculation helper for real-time client-side preview
  const getGrade = (marks) => {
    if (marks === '' || marks === null || isNaN(marks)) return '-';
    const m = parseFloat(marks);
    if (m >= 75) return 'A';
    if (m >= 65) return 'B';
    if (m >= 55) return 'C';
    if (m >= 35) return 'S';
    return 'F';
  };

  const handleMarkChange = (studentId, value) => {
    if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 100)) return; // Bound marks between 0-100
    setMarksheet(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          marks: value,
          grade: getGrade(value)
        };
      }
      return s;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setError('Please choose class, subject, and exam term.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    // Filter students with filled marks
    const records = marksheet
      .filter(s => s.marks !== '' && s.marks !== null)
      .map(s => ({ student_id: s.id, marks: parseFloat(s.marks) }));

    if (records.length === 0) {
      setError('Please enter marks for at least one student.');
      setSaving(false);
      return;
    }

    try {
      await api.post('/teacher/results', {
        class_id: parseInt(selectedClass),
        subject_id: parseInt(selectedSubject),
        exam_term: selectedTerm,
        records
      });
      setSuccess('Class exam marks successfully saved and ranks calculated.');
      await loadMarksheet();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to save exam marks.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMarksheet = marksheet.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    s.admission_no.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (loadingConfig) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading Teacher Curricula...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-school-primary" />
            <span>Enter Academic Marks & Grades</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit results for Term tests, Assignments, or Final Exams. Class and subject ranks recalculate dynamically.
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

      {/* Roster Controls */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 font-sans">Assign Class (Required)</label>
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
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 font-sans">Course Subject (Required)</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
            >
              <option value="">Select Subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 font-sans">{t('examTerm')}</label>
            <select 
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
            >
              <option value="Term 1">Term test 1</option>
              <option value="Term 2">Term test 2</option>
              <option value="Term 3">Term test 3</option>
              <option value="Assignment">Assignment</option>
              <option value="Final Exam">Final Examination</option>
            </select>
          </div>

        </div>
      </div>

      {/* Roster mark sheet */}
      {selectedClass && selectedSubject && (
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
            
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-blue-50 text-school-primary px-3 py-1.5 rounded-lg text-[10px] font-bold">
                <Percent className="w-3.5 h-3.5" />
                <span>Max: 100 Marks</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Auto-Rankings Activated</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 font-sans">
                <Loader2 className="w-6 h-6 animate-spin text-school-primary mx-auto mb-2" />
                <span>Fetching class marksheets...</span>
              </div>
            ) : filteredMarksheet.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-semibold font-sans">
                No students enrolled in class roster.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Admission No</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Score Input (0-100)</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Calculated Grade</th>
                    <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Current Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarksheet.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                      <td className="py-4 px-6 text-xs font-bold text-slate-500 font-mono">{s.admission_no}</td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-800">{s.name}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={s.marks}
                            onChange={(e) => handleMarkChange(s.id, e.target.value)}
                            placeholder="Enter marks..."
                            className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-school-primary/10 focus:border-school-primary focus:bg-white transition-all font-sans"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs border shadow-sm ${
                            s.grade === 'A' 
                              ? 'bg-emerald-50 border-emerald-300 text-school-success' 
                              : s.grade === 'B' 
                                ? 'bg-blue-50 border-blue-200 text-school-accent' 
                                : s.grade === 'C' 
                                  ? 'bg-yellow-50 border-yellow-200 text-amber-500' 
                                  : s.grade === 'S' 
                                    ? 'bg-orange-50 border-orange-200 text-orange-500' 
                                    : s.grade === 'F' 
                                      ? 'bg-red-50 border-red-200 text-school-danger' 
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            {s.grade || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {s.class_rank ? (
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-600 font-mono shadow-sm">
                            #{s.class_rank}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unranked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Save button footer */}
          {!loading && marksheet.length > 0 && (
            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-school-primary hover:bg-school-primary/95 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shadow-blue-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving marks & rankings...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{t('calculateRanks')}</span>
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
