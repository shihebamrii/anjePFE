'use client'; // Enable client component interactive state rendering

import { useState, useEffect, useMemo } from 'react'; // React hooks for local state, mounting, and performance optimizations
import { Card, CardContent } from '@/components/ui/card'; // Card block layouts
import { Badge } from '@/components/ui/badge'; // Status badge labels
import { Input } from '@/components/ui/input'; // Text input form fields
import { Button } from '@/components/ui/button'; // Button triggers
import { LoadingPage } from '@/components/ui/loading'; // Dynamic fullscreen loading spinner
import { academicService } from '@/services/academicService'; // API services module handling courses endpoints
// Modal dialog wrappers
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
// Lucide icons representing books, search, hour counts, levels, additions and options
import { BookOpen, Search, Clock, GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';

// Static template mapping values for default empty form state initialization
const emptyForm = { name: '', code: '', semester: 1, level: 1, hours: { lectures: 0, tutorials: 0, practicals: 0 }, trackName: '' };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]); // Store fetched lesson courses configuration lists
  const [loading, setLoading] = useState(true); // Tracking initial load spinner visibility
  const [search, setSearch] = useState(''); // Text search string filtering courses list
  const [semesterFilter, setSemesterFilter] = useState(''); // Selected semester filter value

  // CRUD dialog modals controls states
  const [dialogOpen, setDialogOpen] = useState(false); // Controls add/edit dialog overlay popup window
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Controls delete confirmation alert modal
  const [editingCourse, setEditingCourse] = useState(null); // Course reference target currently open for updates
  const [deletingCourse, setDeletingCourse] = useState(null); // Course reference target designated for deletion
  const [form, setForm] = useState(emptyForm); // Active input values within modals
  const [saving, setSaving] = useState(false); // API request commit progress loader state
  const [error, setError] = useState(''); // Modal error alerts text label

  // Load department courses list on initial component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Async query fetching active chief's department courses lists
  async function fetchData() {
    try {
      const data = await academicService.getMyCourses();
      setCourses(data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }

  // Filter department courses dynamically based on keyword search matching code/track and semester selections
  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = `${c.name} ${c.code} ${c.trackName}`.toLowerCase().includes(search.toLowerCase());
      const matchSemester = !semesterFilter || c.semester === Number(semesterFilter);
      return matchSearch && matchSemester;
    });
  }, [courses, search, semesterFilter]);

  // Open modal in creation mode
  function handleAdd() {
    setEditingCourse(null);
    setForm(emptyForm); // Reset forms to template
    setError('');
    setDialogOpen(true);
  }

  // Open modal in edit mode with prefilled details
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

  // Commit form updates back to server database
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
        // Run update query if edit reference target is active
        await academicService.updateCourse(editingCourse._id, payload);
      } else {
        // Run addition request
        await academicService.addCourse(payload);
      }
      setDialogOpen(false); // Dismiss modal window
      setLoading(true);
      await fetchData(); // Reload list details
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  // Trigger delete confirmation prompt
  function handleDeleteClick(course) {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  }

  // Perform course deletion task
  async function handleDeleteConfirm() {
    if (!deletingCourse) return;
    setSaving(true);
    try {
      await academicService.deleteCourse(deletingCourse._id);
      setDeleteDialogOpen(false); // Close dialog
      setDeletingCourse(null);
      setLoading(true);
      await fetchData(); // Reload department details
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // Show generic fullscreen spinner if page load is still in progress
  if (loading) return <LoadingPage />;

  return (
    // Outer page layout stack
    <div className="space-y-6">
      
      {/* Title section and Add Course button trigger */}
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

      {/* Dynamic search input and semester tags filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input placeholder="Rechercher par nom, code, filière..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['', '1', '2'].map(sem => (
            // Selectable semester filter buttons
            <button key={sem} onClick={() => setSemesterFilter(sem)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                semesterFilter === sem ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>
              {sem ? `Semestre ${sem}` : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid rendering active courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          // Individual Course card layout
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
                {/* Action controls and total hours box column */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-1 mb-2">
                    <button onClick={() => handleEdit(course)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500 transition-colors" title="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(course)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors" title="Supprimer">
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

              {/* Course pathway labels and Hourly breakdown cards row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                  <GraduationCap size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{course.trackName || 'Toutes filières'} (L{course.level})</span>
                </div>

                {/* Detailed horaire distribution (Cours, TD, TP details) */}
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

      {/* Empty list alert warning label */}
      {filtered.length === 0 && (
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucun cours ne correspond à votre recherche</p>
          </CardContent>
        </Card>
      )}

      {/* Course Create and Edit Modal popup */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Modifier le cours' : 'Ajouter un cours'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Modifiez les informations du cours.' : 'Remplissez les informations du nouveau cours.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-medium">{error}</div>}
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

      {/* Delete confirmation alert block */}
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
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              {saving ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
