'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { departmentService } from '@/services/departmentService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { BookOpen, Search, Mail, Users, Plus, Pencil, Trash2 } from 'lucide-react';

const GRADE_COLORS = {
  'Maît.Tech': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
  'Tech': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  'Ens.Sec': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  'Vac': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  'Ing': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  'Prof.Em': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800',
};

const GRADE_OPTIONS = [
  { value: 'Maître Technologue', abbr: 'Maît.Tech' },
  { value: 'Technologue', abbr: 'Tech' },
  { value: 'Enseignant Secondaire', abbr: 'Ens.Sec' },
  { value: 'Vacataire', abbr: 'Vac' },
  { value: 'Ingénieur', abbr: 'Ing' },
  { value: 'Professeur Émérite', abbr: 'Prof.Em' },
];

const emptyForm = { firstName: '', lastName: '', email: '', grade: '', gradeAbbr: '', specialization: '' };

export default function TeachersPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await departmentService.getMyDepartment();
      setDepartments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const dept = departments[0];
  const teachers = dept?.teachers || [];

  const grades = useMemo(() => {
    const gradeSet = new Set(teachers.map(t => t.gradeAbbr).filter(Boolean));
    return ['', ...Array.from(gradeSet).sort()];
  }, [teachers]);

  const gradeLabels = { '': 'Tous', 'Maît.Tech': 'Maître Technologue', 'Tech': 'Technologue', 'Ens.Sec': 'Ens. Secondaire', 'Vac': 'Vacataire', 'Ing': 'Ingénieur', 'Prof.Em': 'Prof. Émérite' };

  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = `${t.firstName} ${t.lastName} ${t.email} ${t.specialization}`.toLowerCase().includes(search.toLowerCase());
      const matchGrade = !gradeFilter || t.gradeAbbr === gradeFilter;
      return matchSearch && matchGrade;
    });
  }, [teachers, search, gradeFilter]);

  // Open add dialog
  function handleAdd() {
    setEditingTeacher(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  }

  // Open edit dialog
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

  // Save (create or update)
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
      setDialogOpen(false);
      setLoading(true);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  // Delete
  function handleDeleteClick(teacher) {
    setDeletingTeacher(teacher);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingTeacher) return;
    setSaving(true);
    try {
      await departmentService.deleteTeacher(deletingTeacher._id);
      setDeleteDialogOpen(false);
      setDeletingTeacher(null);
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleGradeSelect(e) {
    const opt = GRADE_OPTIONS.find(o => o.abbr === e.target.value);
    setForm(f => ({ ...f, grade: opt?.value || '', gradeAbbr: opt?.abbr || '' }));
  }

  if (loading) return <LoadingPage />;
  if (!dept) return <div className="p-8 text-center text-slate-400">Aucun département trouvé.</div>;

  return (
    <div className="space-y-6">
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input placeholder="Rechercher par nom, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {grades.map(grade => (
            <button key={grade} onClick={() => setGradeFilter(grade)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                gradeFilter === grade ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>{gradeLabels[grade] || grade}</button>
          ))}
        </div>
      </div>

      {/* Table */}
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

      {/* Add/Edit Dialog */}
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

      {/* Delete Confirmation Dialog */}
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
