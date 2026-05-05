'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading';
import { attendanceService } from '@/services/attendanceService';
import { academicService } from '@/services/academicService';
import { getStatusColor, formatDate, getAttendanceRate } from '@/lib/utils';
import {
  ClipboardCheck, Trash2, Check, X, Clock, UserCheck,
  Users, BookOpen, CalendarDays, ChevronRight, Search, AlertCircle, HelpCircle, Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_CONFIG = {
  PRESENT: { label: 'Présent', icon: Check, color: 'bg-emerald-500 text-white', ring: 'ring-emerald-200', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ABSENT:  { label: 'Absent',  icon: X,     color: 'bg-red-500 text-white',    ring: 'ring-red-200',    badge: 'bg-red-50 text-red-700 border-red-200' },
  LATE:    { label: 'Retard',  icon: Clock, color: 'bg-amber-500 text-white',   ring: 'ring-amber-200',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const SESSION_TYPES = [
  { value: 'COURS', label: 'Cours' },
  { value: 'TD', label: 'TD' },
  { value: 'TP', label: 'TP' },
  { value: 'EXAM', label: 'Examen' },
];

export default function AttendancePage() {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();

  // History records for all views
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // History filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyClass, setHistoryClass] = useState('');
  const [historyCourse, setHistoryCourse] = useState('');
  const [historyDate, setHistoryDate] = useState('');

  // Extract unique classes and courses from the history records for the filter dropdowns
  const historyFilterOptions = useMemo(() => {
    if (!records.length) return { classes: [], courses: [] };
    const classes = new Set();
    const courses = new Set();
    records.forEach(r => {
      if (r.student?.className) classes.add(r.student.className);
      if (r.courseName) courses.add(r.courseName);
    });
    return {
      classes: Array.from(classes).sort(),
      courses: Array.from(courses).sort()
    };
  }, [records]);

  // Teacher-only marking state
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('COURS');
  const [durationHours, setDurationHours] = useState('1.5');

  // Student list for marking
  const [classStudents, setClassStudents] = useState([]);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load history + teacher courses on mount
  useEffect(() => {
    async function init() {
      try {
        const [attendanceData, coursesData] = await Promise.all([
          attendanceService.getAttendance().catch(() => []),
          (isTeacher || isAdmin) ? academicService.getTeacherCourses().catch(() => []) : Promise.resolve([]),
        ]);
        setRecords(attendanceData);
        setTeacherCourses(coursesData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    init();
  }, [isTeacher, isAdmin]);

  // Derive unique class names from teacher's courses
  const classNames = useMemo(() => {
    const names = new Set(teacherCourses.map(c => c.className));
    return Array.from(names).sort();
  }, [teacherCourses]);

  // Courses available for the selected class
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

  // When class changes, fetch students
  useEffect(() => {
    if (!selectedClass) {
      setClassStudents([]);
      setStudentStatuses({});
      return;
    }
    async function fetchStudents() {
      setLoadingStudents(true);
      try {
        const students = await attendanceService.getStudentsByClass(selectedClass);
        setClassStudents(students);
        // Default all to null (unselected) instead of PRESENT
        const statuses = {};
        students.forEach(s => { statuses[s._id] = null; });
        setStudentStatuses(statuses);
      } catch (err) { console.error(err); setClassStudents([]); }
      finally { setLoadingStudents(false); }
    }
    fetchStudents();
  }, [selectedClass]);

  // Auto-select first course when class changes
  useEffect(() => {
    if (coursesForClass.length > 0) {
      setSelectedCourse(coursesForClass[0].courseName);
    } else {
      setSelectedCourse('');
    }
  }, [coursesForClass]);

  // Toggle student status: UNMARKED → PRESENT → ABSENT → LATE → PRESENT
  function cycleStatus(studentId) {
    setStudentStatuses(prev => {
      const current = prev[studentId];
      let next;
      if (!current) next = 'PRESENT';
      else if (current === 'PRESENT') next = 'ABSENT';
      else if (current === 'ABSENT') next = 'LATE';
      else next = 'PRESENT';
      
      return { ...prev, [studentId]: next };
    });
  }

  // Set all students to a specific status
  function setAllStatus(status) {
    setStudentStatuses(prev => {
      const updated = {};
      Object.keys(prev).forEach(id => { updated[id] = status; });
      return updated;
    });
  }

  // Bulk save
  async function handleBulkSave() {
    if (!selectedCourse || !sessionDate || classStudents.length === 0) {
      setErrorMsg('Sélectionnez un cours et assurez-vous que la classe a des étudiants.');
      return;
    }

    // Validation: Check if any student is still unmarked
    const unmarkedCount = Object.values(studentStatuses).filter(s => !s).length;
    if (unmarkedCount > 0) {
      setErrorMsg(`Veuillez marquer la présence pour tous les étudiants (${unmarkedCount} non marqués).`);
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const bulkRecords = classStudents.map(s => ({
        student: s._id,
        status: studentStatuses[s._id],
      }));
      const result = await attendanceService.markBulkAttendance({
        courseName: selectedCourse,
        date: sessionDate,
        durationHours: Number(durationHours),
        sessionType,
        records: bulkRecords,
      });
      setSuccessMsg(`✅ ${result.count} enregistrement(s) sauvegardé(s) avec succès !`);
      
      // Refresh history
      const fresh = await attendanceService.getAttendance();
      setRecords(fresh);
      
      // Reset back to Unmarked (null)
      const reset = {};
      classStudents.forEach(s => { reset[s._id] = null; });
      setStudentStatuses(reset);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  // Delete record
  async function handleDelete(id) {
    if (!confirm('Supprimer cet enregistrement ?')) return;
    try {
      await attendanceService.deleteAttendance(id);
      setRecords(records.filter(r => r._id !== id));
    } catch (err) { console.error(err); }
  }

  // Filtered history (base list based on search and new filters)
  const filteredRecords = useMemo(() => {
    let result = records;

    // Search query
    if (historySearch) {
      const q = historySearch.toLowerCase();
      result = result.filter(r =>
        `${r.student?.firstName} ${r.student?.lastName} ${r.courseName}`.toLowerCase().includes(q)
      );
    }

    // Class filter
    if (historyClass) {
      result = result.filter(r => r.student?.className === historyClass);
    }

    // Course filter
    if (historyCourse) {
      result = result.filter(r => r.courseName === historyCourse);
    }

    // Date filter
    if (historyDate) {
      // both handle YYYY-MM-DD
      const filterDateStr = historyDate; 
      result = result.filter(r => {
        if (!r.date) return false;
        const d = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0];
        return d === filterDateStr;
      });
    }

    return result;
  }, [records, historySearch, historyClass, historyCourse, historyDate]);

  // Group history records for teachers/admins based on filteredRecords
  const groupedHistory = useMemo(() => {
    // If student, we don't group, we just use filteredRecords
    if (isStudent) return [];
    
    const groups = {};
    filteredRecords.forEach(record => {
      // Group by Date + CourseName + SessionType
      const dateStr = formatDate(record.date);
      const key = `${dateStr}_${record.courseName}_${record.sessionType}`;
      
      if (!groups[key]) {
        groups[key] = {
          key,
          date: record.date,
          dateStr,
          className: record.student?.className || 'Classe Inconnue',
          courseName: record.courseName,
          sessionType: record.sessionType,
          durationHours: record.durationHours,
          records: [],
          stats: { PRESENT: 0, ABSENT: 0, LATE: 0 }
        };
      }
      groups[key].records.push(record);
      if (groups[key].stats[record.status] !== undefined) {
        groups[key].stats[record.status]++;
      }
    });
    
    // Convert to array and sort by date descending
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredRecords, isStudent]);

  // State for expanded history cards
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Historique des Présences', 14, 22);
    doc.setFontSize(11);
    doc.text(`Date d'exportation: ${formatDate(new Date())}`, 14, 30);
    
    if (isStudent) {
      const tableData = filteredRecords.map(r => [
        r.courseName,
        formatDate(r.date),
        r.sessionType,
        `${r.durationHours}h`,
        STATUS_CONFIG[r.status]?.label || r.status
      ]);
      autoTable(doc, {
        startY: 40,
        head: [['Cours', 'Date', 'Session', 'Durée', 'Statut']],
        body: tableData,
      });
      doc.save('mes_presences.pdf');
    } else {
      let yPos = 40;
      if (groupedHistory.length === 0) {
        doc.text("Aucun enregistrement trouvé.", 14, yPos);
      } else {
        groupedHistory.forEach((group, index) => {
          // Check if we need a new page before drawing the group header
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text(`Séance : ${group.courseName} | Classe : ${group.className}`, 14, yPos);
          yPos += 6;
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Date : ${group.dateStr} | Type : ${group.sessionType} | Durée : ${group.durationHours}h`, 14, yPos);
          yPos += 6;
          doc.text(`Présents: ${group.stats.PRESENT} | Absents: ${group.stats.ABSENT} | Retards: ${group.stats.LATE}`, 14, yPos);
          yPos += 4;
          
          const tableData = group.records.map(r => [
            `${r.student?.firstName} ${r.student?.lastName}`,
            r.student?.registrationNumber || r.student?.studentId || '-',
            STATUS_CONFIG[r.status]?.label || r.status
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['Étudiant', 'Matricule', 'Statut']],
            body: tableData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185] },
          });
          
          yPos = doc.lastAutoTable.finalY + 15;
        });
      }
      doc.save('presences_etudiants.pdf');
    }
  };

  if (loading) return <LoadingPage />;

  const rate = getAttendanceRate(records);
  const present = records.filter(r => r.status === 'PRESENT').length;
  const absent = records.filter(r => r.status === 'ABSENT').length;
  const late = records.filter(r => r.status === 'LATE').length;

  // Count statuses in current marking session
  const markingPresent = Object.values(studentStatuses).filter(s => s === 'PRESENT').length;
  const markingAbsent = Object.values(studentStatuses).filter(s => s === 'ABSENT').length;
  const markingLate = Object.values(studentStatuses).filter(s => s === 'LATE').length;
  const markingUnmarked = Object.values(studentStatuses).filter(s => !s).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <ClipboardCheck size={24} className="text-accent" />
          {isStudent ? 'Mes Présences' : 'Gestion des Présences'}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {isStudent ? 'Consultez votre historique de présence' : 'Marquez et gérez les présences par séance'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Taux de Présence', value: `${rate}%`, gradient: 'from-emerald-500 to-teal-600', icon: UserCheck },
          { label: 'Présent', value: present, gradient: 'from-emerald-500 to-teal-600', icon: Check },
          { label: 'Absent', value: absent, gradient: 'from-red-500 to-red-600', icon: X },
          { label: 'En Retard', value: late, gradient: 'from-amber-500 to-orange-600', icon: Clock },
        ].map((s, i) => (
          <Card key={i} className="border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md`}>
                  <s.icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ TEACHER MARKING SECTION ═══ */}
      {(isTeacher || isAdmin) && (
        <Card className="border-2 border-accent/20 bg-gradient-to-br from-white to-accent/[0.02] dark:from-slate-900 dark:to-accent/[0.02] overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-accent/5 to-transparent">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <UserCheck size={18} className="text-accent" /> Nouvelle Séance de Présence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Step 1 — Class & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Classe *</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm">
                  <option value="">— Choisir une classe —</option>
                  {classNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cours *</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm"
                  disabled={!selectedClass}>
                  <option value="">— Choisir un cours —</option>
                  {coursesForClass.map((c, i) => <option key={i} value={c.courseName}>{c.courseName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date *</label>
                <Input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
                  <select value={sessionType} onChange={e => setSessionType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm">
                    {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Durée</label>
                  <Input type="number" min="0.5" step="0.5" value={durationHours} onChange={e => setDurationHours(e.target.value)} className="h-11" />
                </div>
              </div>
            </div>

            {/* Step 2 — Student List with status toggles */}
            {selectedClass && (
              <>
                {loadingStudents ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size={28} className="text-accent" />
                  </div>
                ) : classStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users size={40} className="text-slate-200 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Aucun étudiant inscrit dans cette classe</p>
                  </div>
                ) : (
                  <>
                    {/* Quick actions bar */}
                    <div className="flex flex-wrap items-center gap-3 py-3 px-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Actions rapides :</span>
                      <button onClick={() => setAllStatus('PRESENT')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors">
                        <Check size={12} /> Tous Présents
                      </button>
                      <button onClick={() => setAllStatus('ABSENT')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
                        <X size={12} /> Tous Absents
                      </button>
                      <div className="ml-auto flex items-center gap-3 text-xs font-bold">
                        <span className="text-slate-400">{markingUnmarked} ❓</span>
                        <span className="text-emerald-600">{markingPresent} ✓</span>
                        <span className="text-red-600">{markingAbsent} ✗</span>
                        <span className="text-amber-600">{markingLate} ⏰</span>
                        <span className="text-slate-400">/ {classStudents.length}</span>
                      </div>
                    </div>

                    {/* Student rows */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                      {classStudents.map((student, i) => {
                        const status = studentStatuses[student._id];
                        // Render a fallback configuration if status is null (unmarked)
                        const config = status ? STATUS_CONFIG[status] : {
                          label: 'Non marqué',
                          icon: HelpCircle,
                          color: 'bg-slate-100 text-slate-400',
                          ring: 'ring-transparent',
                          badge: 'bg-slate-50 text-slate-400 border-slate-200'
                        };

                        return (
                          <div key={student._id}
                            className={`flex items-center gap-4 px-5 py-3.5 ${i < classStudents.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''} hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${!status ? 'bg-slate-50/30 dark:bg-slate-800/30' : ''}`}>
                            {/* Status indicator */}
                            <button onClick={() => cycleStatus(student._id)}
                              className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shadow-md ring-2 ${config.ring} hover:scale-110 transition-all duration-200 shrink-0`}
                              title={`Cliquez pour changer (${config.label})`}>
                              <config.icon size={18} />
                            </button>

                            {/* Student info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{student.firstName} {student.lastName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{student.registrationNumber || student.email}</p>
                            </div>

                            {/* Status buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <button key={key} onClick={() => setStudentStatuses(prev => ({ ...prev, [student._id]: key }))}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                                    status === key
                                      ? `${cfg.badge} ring-2 ${cfg.ring} shadow-sm scale-105`
                                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                  }`}>
                                  {cfg.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Feedback messages */}
                    {errorMsg && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 font-medium">
                        <AlertCircle size={16} /> {errorMsg}
                      </div>
                    )}
                    {successMsg && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 font-medium">
                        <Check size={16} /> {successMsg}
                      </div>
                    )}

                    {/* Save button */}
                    <div className="flex justify-end">
                      <Button onClick={handleBulkSave} disabled={saving || !selectedCourse}
                        className="bg-accent hover:bg-accent/90 text-white rounded-xl shadow-lg shadow-accent/20 px-8 py-3 gap-2 text-sm font-bold">
                        {saving ? (
                          <><LoadingSpinner size={16} /> Enregistrement...</>
                        ) : (
                          <><UserCheck size={16} /> Enregistrer la Séance ({classStudents.length} étudiants)</>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ HISTORY SECTION ═══ */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 shrink-0">Historique des Séances</h2>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {!isStudent && (
              <select value={historyClass} onChange={e => setHistoryClass(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm w-[130px]">
                <option value="">Toutes les classes</option>
                {historyFilterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <select value={historyCourse} onChange={e => setHistoryCourse(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm w-[130px]">
              <option value="">Tous les cours</option>
              {historyFilterOptions.courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} 
              className="h-9 w-[130px] text-xs shadow-sm bg-white dark:bg-slate-900" />
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input placeholder="Rechercher étud...." value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="pl-9 h-9 text-xs" />
            </div>
            {/* Clear Filters Button */}
            {(historySearch || historyClass || historyCourse || historyDate) && (
              <Button variant="ghost" className="h-9 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => { setHistorySearch(''); setHistoryClass(''); setHistoryCourse(''); setHistoryDate(''); }}>
                Vider
              </Button>
            )}
            <Button variant="outline" className="h-9 px-3 text-xs gap-1.5" onClick={handleExportPDF}>
              <Printer size={14} /> Exporter PDF
            </Button>
          </div>
        </div>

        {isStudent ? (
          // --- STUDENT FLAT VIEW ---
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                      <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cours</th>
                      <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session</th>
                      <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Durée</th>
                      <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => {
                      const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.PRESENT;
                      return (
                        <tr key={record._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 text-sm font-bold text-slate-800 dark:text-slate-200">{record.courseName}</td>
                          <td className="p-4 text-sm font-medium text-slate-500">{formatDate(record.date)}</td>
                          <td className="p-4"><Badge variant="secondary" className="text-[10px] font-bold bg-slate-100 text-slate-600 border-0">{record.sessionType}</Badge></td>
                          <td className="p-4 text-sm font-medium text-slate-500">{record.durationHours}h</td>
                          <td className="p-4">
                            <Badge className={`text-[10px] font-bold py-1 px-2 ${statusCfg.badge}`}>{statusCfg.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredRecords.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <CalendarDays size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Aucun historique trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // --- TEACHER & ADMIN GROUPED VIEW ---
          <div className="space-y-3">
            {groupedHistory.map((group) => {
              const isExpanded = expandedGroups[group.key];
              return (
                <Card key={group.key} className={`border-slate-200 transition-all duration-200 ${isExpanded ? 'shadow-md border-accent/20 ring-1 ring-accent/10' : 'shadow-sm hover:border-slate-300'}`}>
                  {/* Card Header (Clickable summary) */}
                  <div 
                    onClick={() => toggleGroup(group.key)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer bg-white dark:bg-slate-900 rounded-xl select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0">
                        <span className="text-xs font-bold text-slate-400 uppercase">{formatDate(group.date).split(' ')[1]}</span>
                        <span className="text-lg font-extrabold text-accent leading-none mt-0.5">{formatDate(group.date).split(' ')[0]}</span>
                      </div>
                      <div>
                        {/* Enhanced Header Info */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{group.courseName}</h3>
                          <Badge className="bg-slate-800 text-white font-bold hover:bg-slate-700 text-[10px]">{group.className}</Badge>
                          <Badge variant="outline" className="text-[10px] font-bold py-0 h-5 border-slate-200 text-slate-500">
                            {group.sessionType} • {group.durationHours}h
                          </Badge>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                          <Users size={12} className="text-slate-400" /> {group.records.length} étudiants enregistrés
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 sm:mt-0 pl-16 sm:pl-0">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-bold text-emerald-600" title="Présents">{group.stats.PRESENT} ✓</span>
                        <div className="w-px h-3 bg-slate-200 mx-1"></div>
                        <span className="text-xs font-bold text-red-600" title="Absents">{group.stats.ABSENT} ✗</span>
                        <div className="w-px h-3 bg-slate-200 mx-1"></div>
                        <span className="text-xs font-bold text-amber-600" title="En Retard">{group.stats.LATE} ⏰</span>
                      </div>
                      <Button variant="ghost" size="icon" className={`h-8 w-8 transition-transform duration-200 ${isExpanded ? 'rotate-90 bg-accent/10 text-accent' : 'text-slate-400 hover:bg-slate-100'}`}>
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Body (Student List) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-0 animate-in fade-in slide-in-from-top-2 duration-200">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="text-left p-3 pl-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Étudiant</th>
                            <th className="text-left p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                            <th className="text-right p-3 pr-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.records.map((record) => {
                            const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.PRESENT;
                            return (
                              <tr key={record._id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                <td className="p-3 pl-5">
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{record.student?.firstName} {record.student?.lastName}</p>
                                  <p className="text-[10px] font-medium text-slate-400 font-mono">{record.student?.registrationNumber || record.student?.studentId}</p>
                                </td>
                                <td className="p-3">
                                  <Badge className={`text-[10px] font-bold py-1 px-2 ${statusCfg.badge}`}>{statusCfg.label}</Badge>
                                </td>
                                <td className="p-3 pr-5 text-right">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50" 
                                    onClick={() => handleDelete(record._id)} title="Supprimer cet enregistrement">
                                    <Trash2 size={14} />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              );
            })}
            
            {groupedHistory.length === 0 && (
              <Card className="border-dashed border-2 shadow-none bg-slate-50 dark:bg-slate-900">
                <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CalendarDays size={32} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium">Aucune séance enregistrée</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}