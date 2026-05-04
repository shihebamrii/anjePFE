'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { gradeService } from '@/services/gradeService';
import { complaintService } from '@/services/complaintService';
import { academicService } from '@/services/academicService';
import { attendanceService } from '@/services/attendanceService';
import { calculateAverage, getGradeColor, formatDate } from '@/lib/utils';
import { GraduationCap, Plus, Trash2, TrendingUp, X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function GradesPage() {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const [grades, setGrades] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    courseName: '', department: '', coefficient: '1', semester: 'S1', type: 'DS'
  });
  const [studentScores, setStudentScores] = useState({});
  const [addingGrades, setAddingGrades] = useState(false);

  // Bulk import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState({
    courseName: '', department: '', semester: 'S1', type: 'DS', coefficient: '1'
  });
  const [parsedRows, setParsedRows] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Complaint state (student)
  const [complaintGradeId, setComplaintGradeId] = useState(null);
  const [complaintReason, setComplaintReason] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complainedGrades, setComplainedGrades] = useState(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [g, courses] = await Promise.all([
          gradeService.getGrades(semesterFilter),
          (isTeacher || isAdmin) ? academicService.getTeacherCourses().catch(() => []) : Promise.resolve([])
        ]);
        setGrades(g);
        setTeacherCourses(courses);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [semesterFilter, isTeacher, isAdmin]);

  const classNames = useMemo(() => {
    const names = new Set(teacherCourses.map(c => c.className));
    return Array.from(names).sort();
  }, [teacherCourses]);

  const coursesForClass = useMemo(() => {
    if (!selectedClass) return [];
    const courseNames = new Set();
    return teacherCourses
      .filter(c => c.className === selectedClass)
      .filter(c => {
        if (courseNames.has(c.courseName)) return false;
        courseNames.add(c.courseName);
        return true;
      });
  }, [teacherCourses, selectedClass]);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setStudentScores({});
      return;
    }
    async function fetchStudents() {
      try {
        const s = await attendanceService.getStudentsByClass(selectedClass);
        setStudents(s);
        const scores = {};
        s.forEach(student => { scores[student._id] = ''; });
        setStudentScores(scores);
      } catch (err) { console.error(err); setStudents([]); }
    }
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (coursesForClass.length > 0) {
      const courseName = coursesForClass[0].courseName;
      setSelectedCourse(courseName);
      setFormData(prev => ({ ...prev, courseName, department: coursesForClass[0].department || '' }));
    } else {
      setSelectedCourse('');
      setFormData(prev => ({ ...prev, courseName: '', department: '' }));
    }
  }, [coursesForClass]);

  const handleAddGradesList = async (e) => {
    e.preventDefault();
    setAddingGrades(true);
    try {
      const promises = Object.entries(studentScores).map(([studentId, score]) => {
         if (score === '' || score === undefined) return Promise.resolve();
         return gradeService.addGrade({ 
           ...formData, 
           student: studentId, 
           score: Number(score), 
           coefficient: Number(formData.coefficient) 
         });
      });
      await Promise.all(promises);
      const g = await gradeService.getGrades(semesterFilter);
      setGrades(g);
      setShowForm(false);
      setFormData({ courseName: '', department: '', coefficient: '1', semester: 'S1', type: 'DS' });
      setStudentScores({});
    } catch (err) { console.error(err); }
    finally { setAddingGrades(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette note ?')) return;
    try {
      await gradeService.deleteGrade(id);
      setGrades(grades.filter(g => g._id !== id));
    } catch (err) { console.error(err); }
  };

  // Complaint handler
  const handleSubmitComplaint = async () => {
    if (!complaintReason.trim() || !complaintGradeId) return;
    setSubmittingComplaint(true);
    try {
      await complaintService.createComplaint({ gradeId: complaintGradeId, reason: complaintReason });
      setComplainedGrades(prev => new Set([...prev, complaintGradeId]));
      setComplaintGradeId(null);
      setComplaintReason('');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // --- Bulk Import Functions ---
  const handleDownloadTemplate = () => {
    const templateData = [
      { studentId: '', score: '' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    // Set column widths
    ws['!cols'] = [{ wch: 20 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notes');
    XLSX.writeFile(wb, 'template_notes.xlsx');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        setParsedRows(rows.map((row, i) => ({
          ...row,
          _rowNum: i + 2,
          _valid: !!(row.studentId && row.score !== undefined && row.score !== '' && Number(row.score) >= 0 && Number(row.score) <= 20),
          _error: !row.studentId ? 'ID manquant' : (row.score === undefined || row.score === '' || isNaN(Number(row.score)) || Number(row.score) < 0 || Number(row.score) > 20) ? 'Score invalide' : null,
        })));
      } catch (err) {
        console.error('Error parsing file:', err);
        setParsedRows([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkSubmit = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('courseName', importData.courseName);
      formData.append('department', importData.department);
      formData.append('semester', importData.semester);
      formData.append('type', importData.type);
      formData.append('coefficient', importData.coefficient);

      const result = await gradeService.bulkUploadGrades(formData);
      setImportResult(result);

      // Refresh grades list
      const g = await gradeService.getGrades(semesterFilter);
      setGrades(g);
    } catch (err) {
      console.error(err);
      setImportResult({ created: 0, errors: [{ row: '-', studentId: '-', reason: err?.response?.data?.message || 'Erreur serveur' }] });
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setParsedRows([]);
    setImportFile(null);
    setImportResult(null);
    setImportData({ courseName: '', department: '', semester: 'S1', type: 'DS', coefficient: '1' });
  };

  if (loading) return <LoadingPage />;

  const avg = calculateAverage(grades);
  const validRows = parsedRows.filter(r => r._valid).length;
  const invalidRows = parsedRows.filter(r => !r._valid).length;
  const canSubmit = importFile && importData.courseName && importData.department && validRows > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <GraduationCap size={24} className="text-accent" />
            {isStudent ? 'Mes Notes' : 'Gestion des Notes'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isStudent ? 'Consultez vos résultats académiques' : 'Ajoutez et gérez les notes des étudiants'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none">
            <option value="">Tous les semestres</option>
            <option value="S1">Semestre 1</option>
            <option value="S2">Semestre 2</option>
          </select>
          {(isTeacher || isAdmin) && (
            <>
              <Button onClick={() => { setShowImportModal(true); setShowForm(false); }} size="sm" variant="outline" className="gap-1.5">
                <Upload size={14} /> Importer Excel
              </Button>
              <Button onClick={() => { setShowForm(!showForm); setShowImportModal(false); }} size="sm">
                {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Ajouter</>}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Average */}
      {isStudent && grades.length > 0 && (
        <Card className="border-0">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <TrendingUp className="text-white" size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Moyenne Générale</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{avg} <span className="text-lg text-slate-400">/ 20</span></p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Grade Form */}
      {showForm && (isTeacher || isAdmin) && (
        <Card className="animate-scale-in border-2 border-accent">
          <CardHeader className="pb-3"><CardTitle className="text-[15px]">Nouvelle Note</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddGradesList} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm">
                  <option value="">— Choisir une classe —</option>
                  {classNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                <select value={selectedCourse} onChange={e => {
                    setSelectedCourse(e.target.value);
                    const c = coursesForClass.find(x => x.courseName === e.target.value);
                    setFormData(prev => ({ ...prev, courseName: e.target.value, department: c?.department || prev.department }));
                  }}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                  disabled={!selectedClass}>
                  <option value="">— Choisir un cours —</option>
                  {coursesForClass.map((c, i) => <option key={i} value={c.courseName}>{c.courseName}</option>)}
                </select>
                <Input type="number" placeholder="Coefficient" min="0.5" step="0.5" value={formData.coefficient} onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })} required />
                <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                  <option value="S1">Semestre 1</option>
                  <option value="S2">Semestre 2</option>
                </select>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                  <option value="DS">DS</option>
                  <option value="EXAM">Examen</option>
                  <option value="TP">TP</option>
                  <option value="TD">TD</option>
                  <option value="PROJECT">Projet</option>
                </select>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3 border-b pb-2">Liste des étudiants</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {students.map(s => (
                    <div key={s._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.firstName} {s.lastName}</span>
                      <Input type="number" placeholder="Note (0-20)" min="0" max="20" step="0.25" className="w-32 h-9"
                        value={studentScores[s._id] !== undefined ? studentScores[s._id] : ''}
                        onChange={(e) => setStudentScores(prev => ({...prev, [s._id]: e.target.value}))}
                      />
                    </div>
                  ))}
                  {students.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">Aucun étudiant trouvé.</p>}
                </div>
              </div>

              <div>
                <Button type="submit" variant="accent" className="w-full sm:w-auto gap-2" disabled={addingGrades || students.length === 0}>
                  {addingGrades ? 'Enregistrement...' : 'Enregistrer les notes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ─── IMPORT MODAL ─── */}
      {showImportModal && (isTeacher || isAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) closeImportModal(); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <FileSpreadsheet className="text-white" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Importer des Notes</h2>
                  <p className="text-xs text-slate-400">Importez un fichier Excel avec les colonnes studentId et score</p>
                </div>
              </div>
              <button onClick={closeImportModal} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Common Fields */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">1</span>
                  Informations communes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Input placeholder="Matière *" value={importData.courseName} onChange={(e) => setImportData({ ...importData, courseName: e.target.value })} />
                  <Input placeholder="Département *" value={importData.department} onChange={(e) => setImportData({ ...importData, department: e.target.value })} />
                  <select value={importData.semester} onChange={(e) => setImportData({ ...importData, semester: e.target.value })}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                    <option value="S1">Semestre 1</option>
                    <option value="S2">Semestre 2</option>
                  </select>
                  <select value={importData.type} onChange={(e) => setImportData({ ...importData, type: e.target.value })}
                    className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                    <option value="DS">DS</option>
                    <option value="EXAM">Examen</option>
                    <option value="TP">TP</option>
                    <option value="TD">TD</option>
                    <option value="PROJECT">Projet</option>
                  </select>
                  <Input type="number" placeholder="Coefficient" min="0.5" step="0.5" value={importData.coefficient} onChange={(e) => setImportData({ ...importData, coefficient: e.target.value })} />
                </div>
              </div>

              {/* Step 2: Template & Upload */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">2</span>
                  Fichier Excel
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-1.5 shrink-0">
                    <Download size={14} /> Télécharger le modèle
                  </Button>
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-accent dark:hover:border-accent cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50">
                      <Upload size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-500 truncate">
                        {importFile ? importFile.name : 'Choisir un fichier .xlsx'}
                      </span>
                      <input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 3: Preview */}
              {parsedRows.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">3</span>
                    Aperçu
                    <span className="ml-auto text-xs font-normal text-slate-400">
                      <span className="text-emerald-500 font-semibold">{validRows} valide{validRows > 1 ? 's' : ''}</span>
                      {invalidRows > 0 && <> · <span className="text-red-500 font-semibold">{invalidRows} erreur{invalidRows > 1 ? 's' : ''}</span></>}
                    </span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800">
                          <th className="text-left p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ligne</th>
                          <th className="text-left p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student ID</th>
                          <th className="text-left p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Score</th>
                          <th className="text-left p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 50).map((row, i) => (
                          <tr key={i} className={`border-t border-slate-100 dark:border-slate-800 ${!row._valid ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                            <td className="p-3 text-xs text-slate-400">{row._rowNum}</td>
                            <td className="p-3 text-sm font-medium text-slate-800 dark:text-slate-200">{row.studentId || '—'}</td>
                            <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{row.score ?? '—'}</td>
                            <td className="p-3">
                              {row._valid ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={12} /> OK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                                  <AlertCircle size={12} /> {row._error}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedRows.length > 50 && (
                      <p className="text-xs text-slate-400 text-center py-2">... et {parsedRows.length - 50} lignes supplémentaires</p>
                    )}
                  </div>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className={`p-4 rounded-xl border ${importResult.created > 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {importResult.created > 0 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {importResult.created} note{importResult.created > 1 ? 's' : ''} créée{importResult.created > 1 ? 's' : ''}
                    </span>
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">Erreurs :</p>
                      {importResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-500">
                          Ligne {err.row} (ID: {err.studentId}) — {err.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={closeImportModal}>
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!canSubmit || importing}
                onClick={handleBulkSubmit}
                className="gap-1.5"
              >
                {importing ? (
                  <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importation...</>
                ) : (
                  <><CheckCircle2 size={14} /> Enregistrer {validRows > 0 ? `(${validRows})` : ''}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  {!isStudent && <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Étudiant</th>}
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Matière</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Note</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Coeff.</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Semestre</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-right p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    {!isStudent && (
                      <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-200">{grade.student?.firstName} {grade.student?.lastName}</td>
                    )}
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{grade.courseName}</p>
                    </td>
                    <td className="p-4"><Badge variant="secondary" className="text-[10px]">{grade.type}</Badge></td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${getGradeColor(grade.score)}`}>{grade.score}/20</span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">×{grade.coefficient}</td>
                    <td className="p-4 text-sm text-slate-500">{grade.semester}</td>
                    <td className="p-4 text-sm text-slate-400">{formatDate(grade.date)}</td>
                    <td className="p-4 text-right">
                      {(isTeacher || isAdmin) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDelete(grade._id)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                      {isStudent && (
                        complainedGrades.has(grade._id) ? (
                          <span className="text-[11px] text-amber-500 font-semibold flex items-center justify-end gap-1"><AlertTriangle size={12} /> Réclamée</span>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-xs text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950 gap-1" onClick={() => { setComplaintGradeId(grade._id); setComplaintReason(''); }}>
                            <AlertTriangle size={12} /> Réclamer
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {grades.length === 0 && <p className="text-sm text-slate-400 text-center py-12">Aucune note disponible</p>}
          </div>
        </CardContent>
      </Card>

      {/* Complaint Modal */}
      {complaintGradeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setComplaintGradeId(null); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Réclamer cette note</h2>
              </div>
              <button onClick={() => setComplaintGradeId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Pourquoi réclamez-vous cette note ?</label>
              <textarea
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
                placeholder="Décrivez la raison de votre réclamation..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setComplaintGradeId(null)}>Annuler</Button>
              <Button
                type="button"
                size="sm"
                disabled={!complaintReason.trim() || submittingComplaint}
                onClick={handleSubmitComplaint}
                className="gap-1.5"
              >
                {submittingComplaint ? (
                  <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
                ) : (
                  <><AlertTriangle size={14} /> Envoyer la réclamation</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
