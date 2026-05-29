import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../utils/api';
import { 
  FileSpreadsheet, 
  Loader2, 
  Printer, 
  ArrowLeft,
  Users,
  GraduationCap,
  Percent,
  Award
} from 'lucide-react';

export default function Results() {
  const { t } = useLanguage();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const queryStudentId = queryParams.get('student_id');

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');

  const [activeTerm, setActiveTerm] = useState('Term 1');

  useEffect(() => {
    async function loadConfig() {
      try {
        const kidList = await api.get('/parent/children');
        setChildren(kidList);
        
        if (kidList.length > 0) {
          const matched = queryStudentId 
            ? kidList.find(c => c.id === parseInt(queryStudentId))
            : null;
          setSelectedChild(matched || kidList[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load child list.');
        setLoading(false);
      }
    }
    loadConfig();
  }, [queryStudentId]);

  useEffect(() => {
    if (selectedChild) {
      loadResults(selectedChild.id);
    }
  }, [selectedChild]);

  async function loadResults(childId) {
    setLoadingResults(true);
    setError('');
    try {
      const data = await api.get(`/parent/results/${childId}`);
      setResultsData(data);
    } catch (err) {
      setError('Failed to fetch child progress report card.');
    } finally {
      setLoadingResults(false);
      setLoading(false);
    }
  }

  const handleChildSwitch = (e) => {
    const kid = children.find(c => c.id === parseInt(e.target.value));
    if (kid) setSelectedChild(kid);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-school-primary mr-2" />
        <span>Loading child progress reports...</span>
      </div>
    );
  }

  const activeTermRecords = resultsData?.results?.[activeTerm] || [];
  const activeTermSummary = resultsData?.summaries?.[activeTerm];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm no-print">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-school-primary" />
              <span>Report Card ({selectedChild?.name})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official term report cards, grading metrics, and class rankings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {children.length > 1 && (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-slate-500" />
              <select 
                value={selectedChild?.id} 
                onChange={handleChildSwitch}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer font-sans"
              >
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.class_name})</option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-school-primary hover:bg-school-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all select-none hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printReport')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl text-xs font-semibold text-red-600 no-print">
          {error}
        </div>
      )}

      {selectedChild && resultsData && (
        <div className="space-y-6">
          
          {/* Term selector bar */}
          <div className="flex gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-sm no-print overflow-x-auto">
            {['Term 1', 'Term 2', 'Term 3', 'Assignment', 'Final Exam'].map((term) => (
              <button
                key={term}
                onClick={() => setActiveTerm(term)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap ${
                  activeTerm === term
                    ? 'bg-school-primary text-white shadow-sm'
                    : 'bg-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                {term === 'Final Exam' ? 'Final Examination' : term === 'Assignment' ? 'Assignment Portfolio' : term}
              </button>
            ))}
          </div>

          {/* PRINT-ONLY HEADER HEADER */}
          <div className="hidden print-only text-center border-b-4 border-double border-slate-800 pb-5 mb-6 font-sans">
            <h1 className="text-2xl font-extrabold tracking-tight">SMARTSCHOOL LK ACADEMIC SYSTEM</h1>
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mt-1">Official Student Progress Record</p>
            
            <div className="grid grid-cols-2 gap-4 text-left max-w-xl mx-auto mt-6 p-4 border border-slate-300 rounded-xl bg-slate-50/50">
              <div>
                <p className="text-xs font-semibold text-slate-500">Student Name:</p>
                <h4 className="text-sm font-extrabold text-slate-800">{selectedChild.name}</h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Admission Number:</p>
                <h4 className="text-sm font-extrabold text-slate-800 font-mono">{selectedChild.admission_no}</h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Class Room:</p>
                <h4 className="text-sm font-extrabold text-slate-800">{selectedChild.class_name}</h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Assessment Term:</p>
                <h4 className="text-sm font-extrabold text-slate-800">{activeTerm === 'Final Exam' ? 'Final Examination' : activeTerm}</h4>
              </div>
            </div>
          </div>

          {/* ACTIVE TERM DETAILS */}
          {loadingResults ? (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-xs text-slate-400 font-sans">
              <Loader2 className="w-6 h-6 animate-spin text-school-primary mx-auto mb-2" />
              <span>Fetching term report card...</span>
            </div>
          ) : activeTermRecords.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-xs text-slate-400 font-semibold font-sans">
              No marks published online for this term yet.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Term Summaries cards */}
              {activeTermSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 no-print">
                  
                  {/* Total score */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
                    <div className="p-3 bg-blue-50 text-school-primary rounded-xl">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                        Aggregate Score
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-800 leading-none">
                        {activeTermSummary.total_marks} Marks
                      </h3>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1 font-sans">
                        Subjects: {activeTermSummary.total_subjects} courses
                      </span>
                    </div>
                  </div>

                  {/* Average */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
                    <div className="p-3 bg-emerald-50 text-school-success rounded-xl">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                        Term Average
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-800 leading-none">
                        {activeTermSummary.average}%
                      </h3>
                    </div>
                  </div>

                  {/* GPA Grade */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 school-card-hover">
                    <div className="p-3 bg-amber-50 text-school-warning rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                        GPA Grade
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-800 leading-none">
                        Grade {activeTermSummary.gpa_grade}
                      </h3>
                    </div>
                  </div>

                </div>
              )}

              {/* Subject report card table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print-report-card">
                <div className="p-5 border-b border-slate-100 bg-slate-50/20 px-6 hidden sm:block no-print">
                  <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                    {activeTerm} Progress Marks sheet
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/20">
                        <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Subject Course</th>
                        <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Conducting Teacher</th>
                        <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Marks Score</th>
                        <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Grade</th>
                        <th className="py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Class Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTermRecords.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                          <td className="py-4 px-6 text-xs font-bold text-slate-800">{r.subject_name}</td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-semibold">{r.teacher_name || 'Class Teacher'}</td>
                          <td className="py-4 px-6 text-center text-xs font-extrabold text-school-primary font-mono">{r.marks}%</td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[11px] border ${
                                r.grade === 'A' 
                                  ? 'bg-emerald-50 border-emerald-300 text-school-success' 
                                  : r.grade === 'B' 
                                    ? 'bg-blue-50 border-blue-200 text-school-accent' 
                                    : r.grade === 'C' 
                                      ? 'bg-yellow-50 border-yellow-200 text-amber-500' 
                                      : r.grade === 'S' 
                                        ? 'bg-orange-50 border-orange-200 text-orange-500' 
                                        : 'bg-red-50 border-red-200 text-school-danger'
                              }`}>
                                {r.grade}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-600 font-mono shadow-sm">
                                #{r.class_rank}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Print-only summary details */}
                {activeTermSummary && (
                  <div className="hidden print-only p-6 bg-slate-50 border-t border-slate-200 text-right space-y-1 text-sm font-sans font-semibold">
                    <p>Total Score: <span className="font-extrabold font-mono">{activeTermSummary.total_marks} Marks</span></p>
                    <p>Term Average: <span className="font-extrabold font-mono text-school-primary">{activeTermSummary.average}%</span></p>
                    <p>Overall Term GPA Grade: <span className="font-extrabold text-school-success">{activeTermSummary.gpa_grade}</span></p>
                  </div>
                )}

              </div>

              {/* PRINT-ONLY SIGNATURE SECTION */}
              <div className="hidden print-only mt-16 pt-12 flex justify-between max-w-xl mx-auto text-center text-xs font-bold text-slate-700 font-sans">
                <div className="w-44 border-t border-slate-400 pt-2">
                  <span>Class Teacher's Signature</span>
                </div>
                <div className="w-44 border-t border-slate-400 pt-2">
                  <span>Principal / Director</span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
