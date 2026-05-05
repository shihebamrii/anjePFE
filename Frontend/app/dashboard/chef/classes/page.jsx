'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { departmentService } from '@/services/departmentService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { School, Search, Users, GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', level: 1, track: '', students: 0, academicYear: '2025-2026' };

export default function ClassesPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(null);
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
  const classesList = dept?.classes || [];

  const filtered = useMemo(() => {
    return classesList.filter(c => {
      const matchSearch = `${c.name} ${c.track}`.toLowerCase().includes(search.toLowerCase());
      const matchLevel = !levelFilter || c.level === Number(levelFilter);
      return matchSearch && matchLevel;
    });
  }, [classesList, search, levelFilter]);

  function handleAdd() {
    setEditingClass(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  }

  function handleEdit(cls) {
    setEditingClass(cls);
    setForm({
      name: cls.name || '',
      level: cls.level || 1,
      track: cls.track || '',
      students: cls.students || 0,
      academicYear: cls.academicYear || '2025-2026',
    });
    setError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.level) {
      setError('Nom et niveau sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, level: Number(form.level), students: Number(form.students) };
      if (editingClass) {
        await departmentService.updateClass(editingClass._id, payload);
      } else {
        await departmentService.addClass(payload);
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

  function handleDeleteClick(cls) {
    setDeletingClass(cls);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingClass) return;
    setSaving(true);
    try {
      await departmentService.deleteClass(deletingClass._id);
      setDeleteDialogOpen(false);
      setDeletingClass(null);
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingPage />;
  if (!dept) return <div className="p-8 text-center text-slate-400">Aucun département trouvé.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <School size={24} className="text-accent" /> Mes Classes
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {dept.name} — <span className="font-semibold text-slate-700 dark:text-slate-300">{classesList.length}</span> classes ({classesList.reduce((acc, c) => acc + (c.students || 0), 0)} étudiants)
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
          <Input placeholder="Rechercher une classe, filière..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {['', '1', '2', '3'].map(level => (
            <button key={level} onClick={() => setLevelFilter(level)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                levelFilter === level ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>
              {level ? `L${level}` : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cls, i) => (
          <Card key={cls._id || i} className="border-0 card-interactive group overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-600" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{cls.name}</h3>
                  <Badge variant="secondary" className="mt-1.5 text-[10px] uppercase tracking-wider font-bold">
                    Licence {cls.level}
                  </Badge>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 font-medium">Effectif</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold mt-0.5">
                    <Users size={14} className="text-indigo-500" />
                    {cls.students}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-start gap-2 border-t border-slate-100 dark:border-slate-800">
                <GraduationCap size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-snug flex-1">{cls.track}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(cls)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500 transition-colors" title="Modifier">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(cls)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors" title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <School size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucune classe ne correspond à votre recherche</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Modifier la classe' : 'Ajouter une classe'}</DialogTitle>
            <DialogDescription>
              {editingClass ? 'Modifiez les informations de la classe.' : 'Remplissez les informations de la nouvelle classe.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-medium">{error}</div>}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nom *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: L1-INFO-A" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Niveau *</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option value={1}>Licence 1</option>
                  <option value={2}>Licence 2</option>
                  <option value={3}>Licence 3</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Effectif</label>
                <Input type="number" value={form.students} onChange={e => setForm(f => ({ ...f, students: e.target.value }))} min={0} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Filière / Parcours</label>
              <Input value={form.track} onChange={e => setForm(f => ({ ...f, track: e.target.value }))} placeholder="Ex: Technologies de l'informatique" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Année universitaire</label>
              <Input value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="2025-2026" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2">
              {saving ? 'Enregistrement...' : (editingClass ? 'Mettre à jour' : 'Ajouter')}
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
              Voulez-vous vraiment supprimer la classe <span className="font-bold text-slate-700">{deletingClass?.name}</span> ?
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
