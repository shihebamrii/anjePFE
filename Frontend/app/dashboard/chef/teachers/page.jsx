'use client'; // Client interactive state component directive

import { useState, useEffect, useMemo } from 'react'; // React hooks for local state, updates and performance tracking
import { Card, CardContent } from '@/components/ui/card'; // Card block layouts
import { Badge } from '@/components/ui/badge'; // Label tags
import { Input } from '@/components/ui/input'; // Input text boxes
import { Button } from '@/components/ui/button'; // Reusable buttons
import { LoadingPage } from '@/components/ui/loading'; // Dynamic fullscreen page loader
import { departmentService } from '@/services/departmentService'; // Services module to interact with department API calls
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Circular profile avatar images fallback
import { getInitials } from '@/lib/utils'; // Initials generator helper
// Dialog modals wrappers
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
// Lucide icons representing entities, queries, email coordinates and buttons actions
import { BookOpen, Search, Mail, Users, Plus, Pencil, Trash2 } from 'lucide-react';

// Configuration maps associating grade abbreviations to specific styling color classes
const GRADE_COLORS = {
  'Maît.Tech': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
  'Tech': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  'Ens.Sec': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  'Vac': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  'Ing': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  'Prof.Em': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800',
};

// Selection options representing teacher academic grades inside the institution
const GRADE_OPTIONS = [
  { value: 'Maître Technologue', abbr: 'Maît.Tech' },
  { value: 'Technologue', abbr: 'Tech' },
  { value: 'Enseignant Secondaire', abbr: 'Ens.Sec' },
  { value: 'Vacataire', abbr: 'Vac' },
  { value: 'Ingénieur', abbr: 'Ing' },
  { value: 'Professeur Émérite', abbr: 'Prof.Em' },
];

// Form initial state values template
const emptyForm = { firstName: '', lastName: '', email: '', grade: '', gradeAbbr: '', specialization: '' };

export default function TeachersPage() {
  const [departments, setDepartments] = useState([]); // Store fetched departments configuration list
  const [loading, setLoading] = useState(true); // Tracking fetching status
  const [search, setSearch] = useState(''); // Text search query string filtering lists
  const [gradeFilter, setGradeFilter] = useState(''); // Active grade category filter selection

  // CRUD dialog modals controls states
  const [dialogOpen, setDialogOpen] = useState(false); // Controls add/edit modal popup window
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Controls delete confirmation dialog modal
  const [editingTeacher, setEditingTeacher] = useState(null); // Reference to teacher object currently being modified
  const [deletingTeacher, setDeletingTeacher] = useState(null); // Reference to teacher object target designated for removal
  const [form, setForm] = useState(emptyForm); // Active input values within modals
  const [saving, setSaving] = useState(false); // API request save progress loader state
  const [error, setError] = useState(''); // Modal error alerts text label

  // Load department info on initial component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Async query fetching active chief's department details
  async function fetchData() {
    try {
      const data = await departmentService.getMyDepartment();
      setDepartments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const dept = departments[0];
  const teachers = dept?.teachers || [];

  // Compute unique grade abbreviations from active teachers list
  const grades = useMemo(() => {
    const gradeSet = new Set(teachers.map(t => t.gradeAbbr).filter(Boolean));
    return ['', ...Array.from(gradeSet).sort()];
  }, [teachers]);

  const gradeLabels = { '': 'Tous', 'Maît.Tech': 'Maître Technologue', 'Tech': 'Technologue', 'Ens.Sec': 'Ens. Secondaire', 'Vac': 'Vacataire', 'Ing': 'Ingénieur', 'Prof.Em': 'Prof. Émérite' };

  // Filter teachers list dynamically based on search keyword matching names/email/specialty and grade category selections
  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = `${t.firstName} ${t.lastName} ${t.email} ${t.specialization}`.toLowerCase().includes(search.toLowerCase());
      const matchGrade = !gradeFilter || t.gradeAbbr === gradeFilter;
      return matchSearch && matchGrade;
    });
  }, [teachers, search, gradeFilter]);

  // Open modal in creation mode
  function handleAdd() {
    setEditingTeacher(null);
    setForm(emptyForm); // Reset form state
    setError('');
    setDialogOpen(true);
  }

  // Open modal in edit mode with prefilled details
  function handleEdit(teacher) {
    setEditingTeacher(teacher);
    setForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      grade: teacher.grade || '',
      gradeAbbr: teacher.gradeAbbr || '',
      specialization: teacher.specialization || '',
    });
    setError('');
    setDialogOpen(true);
  }

  // Commit form updates back to server database
  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Nom et prénom sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingTeacher) {
        await departmentService.updateTeacher(editingTeacher._id, form);
      } else {
        await departmentService.addTeacher(form);
      }
      setDialogOpen(false); // Dismiss modal window
      setLoading(true);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  // Trigger delete confirmation prompt
  function handleDeleteClick(teacher) {
    setDeletingTeacher(teacher);
    setDeleteDialogOpen(true);
  }

  // Perform teacher account deletion task
  async function handleDeleteConfirm() {
    if (!deletingTeacher) return;
    setSaving(true);
    try {
      await departmentService.deleteTeacher(deletingTeacher._id);
      setDeleteDialogOpen(false); // Close dialog
      setDeletingTeacher(null);
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // Handle grade selection change in dynamic form dropdown selector
  function handleGradeSelect(e) {
    const opt = GRADE_OPTIONS.find(o => o.abbr === e.target.value);
    setForm(f => ({ ...f, grade: opt?.value || '', gradeAbbr: opt?.abbr || '' }));
  }

  if (loading) return <LoadingPage />;
  if (!dept) return <div className="p-8 text-center text-slate-400">Aucun département trouvé.</div>;

  return (
    <div className="space-y-6">
      {/* Title section and Add Teacher button trigger */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <BookOpen size={24} className="text-accent" /> Mes Enseignants
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {dept.name} — <span className="font-semibold text-slate-700 dark:text-slate-300">{teachers.length}</span> enseignants
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-white rounded-xl shadow-md shadow-accent/20 gap-2">
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      {/* Dynamic search input and grade category select filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input placeholder="Rechercher par nom, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {grades.map(grade => (
            // Selectable grade category filter buttons
            <button key={grade} onClick={() => setGradeFilter(grade)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                gradeFilter === grade ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>{gradeLabels[grade] || grade}</button>
          ))}
        </div>
      </div>

      {/* Table displaying matching teachers list */}
      <Card className="border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Enseignant</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Grade</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Spécialisation</th>
                  <th className="text-right p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher, i) => (
                  <tr key={teacher._id || i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-[10px]">{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{teacher.firstName} {teacher.lastName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <a href={`mailto:${teacher.email}`} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1.5 transition-colors">
                        <Mail size={13} className="shrink-0" /> {teacher.email}
                      </a>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-[10px] ${GRADE_COLORS[teacher.gradeAbbr] || GRADE_COLORS['Vac']}`}>
                        {teacher.grade}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{teacher.specialization || '—'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(teacher)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500 transition-colors" title="Modifier">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDeleteClick(teacher)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors" title="Supprimer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 text-sm">Aucun enseignant trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-slate-400 text-center">{filtered.length} enseignant{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}</p>

      {/* Teacher Create and Edit Modal popup */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'}</DialogTitle>
            <DialogDescription>
              {editingTeacher ? 'Modifiez les informations de l\'enseignant.' : 'Remplissez les informations du nouvel enseignant.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-medium">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Prénom *</label>
                <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Prénom" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nom *</label>
                <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Nom" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@isetgf.rnu.tn" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Grade</label>
              <select value={form.gradeAbbr} onChange={handleGradeSelect}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                <option value="">— Sélectionner —</option>
                {GRADE_OPTIONS.map(o => <option key={o.abbr} value={o.abbr}>{o.value}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Spécialisation</label>
              <Input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} placeholder="Ex: Informatique, Réseaux..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2">
              {saving ? 'Enregistrement...' : (editingTeacher ? 'Mettre à jour' : 'Ajouter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation alert block */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer <span className="font-bold text-slate-700">{deletingTeacher?.firstName} {deletingTeacher?.lastName}</span> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              {saving ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
