'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { academicService } from '@/services/academicService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { BookOpen, Search, Clock, GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', code: '', semester: 1, level: 1, hours: { lectures: 0, tutorials: 0, practicals: 0 }, trackName: '' };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await academicService.getMyCourses();
      setCourses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = `${c.name} ${c.code} ${c.trackName}`.toLowerCase().includes(search.toLowerCase());
      const matchSemester = !semesterFilter || c.semester === Number(semesterFilter);
      return matchSearch && matchSemester;
    });
  }, [courses, search, semesterFilter]);

  function handleAdd() {
    setEditingCourse(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  }

  function handleEdit(course) {
    setEditingCourse(course);
    setForm({
      name: course.name || '',
      code: course.code || '',
      semester: course.semester || 1,
      level: course.level || 1,
      hours: {
        lectures: course.hours?.lectures || 0,
        tutorials: course.hours?.tutorials || 0,
        practicals: course.hours?.practicals || 0,
      },
      trackName: course.trackName || '',
    });
    setError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) {
      setError('Nom et code sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        semester: Number(form.semester),
        level: Number(form.level),
        hours: {
          lectures: Number(form.hours.lectures),
          tutorials: Number(form.hours.tutorials),
          practicals: Number(form.hours.practicals),
        },
      };
      if (editingCourse) {
        await academicService.updateCourse(editingCourse._id, payload);
      } else {
        await academicService.addCourse(payload);
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

  function handleDeleteClick(course) {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingCourse) return;
    setSaving(true);
    try {
      await academicService.deleteCourse(deletingCourse._id);
      setDeleteDialogOpen(false);
      setDeletingCourse(null);
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <BookOpen size={24} className="text-accent" /> Cours et Matières
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gérez les matières enseignées dans votre département — <span className="font-semibold text-slate-700 dark:text-slate-300">{courses.length}</span> cours au total
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
          <Input placeholder="Rechercher par nom, code, filière..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['', '1', '2'].map(sem => (
            <button key={sem} onClick={() => setSemesterFilter(sem)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                semesterFilter === sem ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>
              {sem ? `Semestre ${sem}` : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <Card key={course._id || i} className="border-0 card-interactive group overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="pr-4 flex-1">
                  <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">{course.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold text-slate-500">
                      {course.code}
                    </Badge>
                    <Badge className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
                      Semestre {course.semester}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  {/* Actions */}
                  <div className="flex items-center gap-1 mb-2">
                    <button onClick={() => handleEdit(course)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500 transition-colors" title="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(course)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 transition-colors" title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Total</span>
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-extrabold text-lg">
                      <Clock size={16} className="text-teal-500" />
                      {(course.hours?.lectures || 0) + (course.hours?.tutorials || 0) + (course.hours?.practicals || 0)}h
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                  <GraduationCap size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{course.trackName || 'Toutes filières'} (L{course.level})</span>
                </div>

                {/* Volume Horaire breakdown */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-lg px-2 py-1.5 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase opacity-70">Cours</span>
                    <span className="text-xs font-extrabold">{course.hours?.lectures || 0}h</span>
                  </div>
                  <div className="flex-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-lg px-2 py-1.5 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase opacity-70">TD</span>
                    <span className="text-xs font-extrabold">{course.hours?.tutorials || 0}h</span>
                  </div>
                  <div className="flex-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800 rounded-lg px-2 py-1.5 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase opacity-70">TP</span>
                    <span className="text-xs font-extrabold">{course.hours?.practicals || 0}h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucun cours ne correspond à votre recherche</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Modifier le cours' : 'Ajouter un cours'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Modifiez les informations du cours.' : 'Remplissez les informations du nouveau cours.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 font-medium">{error}</div>}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nom du cours *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Algorithmique" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Code *</label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="ALG101" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Semestre</label>
                <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option value={1}>S1</option>
                  <option value={2}>S2</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Niveau</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option value={1}>L1</option>
                  <option value={2}>L2</option>
                  <option value={3}>L3</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Filière / Parcours</label>
              <Input value={form.trackName} onChange={e => setForm(f => ({ ...f, trackName: e.target.value }))} placeholder="Ex: Technologies de l'informatique" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Volume Horaire</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Cours (h)</label>
                  <Input type="number" min={0} value={form.hours.lectures}
                    onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, lectures: e.target.value } }))}
                    className="bg-white border-blue-200 text-center font-bold" />
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
                  <label className="text-[10px] font-bold text-amber-600 uppercase block mb-1">TD (h)</label>
                  <Input type="number" min={0} value={form.hours.tutorials}
                    onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, tutorials: e.target.value } }))}
                    className="bg-white border-amber-200 text-center font-bold" />
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                  <label className="text-[10px] font-bold text-purple-600 uppercase block mb-1">TP (h)</label>
                  <Input type="number" min={0} value={form.hours.practicals}
                    onChange={e => setForm(f => ({ ...f, hours: { ...f.hours, practicals: e.target.value } }))}
                    className="bg-white border-purple-200 text-center font-bold" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2">
              {saving ? 'Enregistrement...' : (editingCourse ? 'Mettre à jour' : 'Ajouter')}
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
              Voulez-vous vraiment supprimer le cours <span className="font-bold text-slate-700">{deletingCourse?.name}</span> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
              {saving ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
