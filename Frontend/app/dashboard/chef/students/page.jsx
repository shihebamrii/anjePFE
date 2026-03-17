'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { academicService } from '@/services/academicService';
import { departmentService } from '@/services/departmentService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Search, School, User as UserIcon, Mail, Hash, Plus, Pencil, Trash2, ChevronDown, Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as xlsx from 'xlsx';

const emptyForm = { firstName: '', lastName: '', email: '', registrationNumber: '', classId: '', className: '' };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Bulk Import State
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkData, setBulkData] = useState(null);
  const [bulkErrors, setBulkErrors] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [studentsData, deptsData] = await Promise.all([
        academicService.getStudents(),
        departmentService.getMyDepartment()
      ]);
      setStudents(studentsData);
      if (deptsData && deptsData.length > 0) {
        const classList = deptsData[0].classes || [];
        setClasses(classList.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registrationNumber?.includes(searchQuery);

      const matchesClass = selectedClass === 'ALL' || student.classId === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, selectedClass]);

  // Open add dialog
  function handleAdd() {
    setEditingStudent(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  }

  // Open edit dialog
  function handleEdit(student) {
    setEditingStudent(student);
    setForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      registrationNumber: student.registrationNumber || '',
      classId: student.classId || '',
      className: student.className || '',
    });
    setError('');
    setDialogOpen(true);
  }

  // When class selection changes in the form, auto-set className
  function handleClassChange(e) {
    const classId = e.target.value;
    const cls = classes.find(c => c._id === classId);
    setForm(f => ({ ...f, classId, className: cls?.name || '' }));
  }

  // Save (create or update)
  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Nom, prénom et email sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingStudent) {
        await academicService.updateStudent(editingStudent._id, form);
      } else {
        await academicService.addStudent(form);
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
  function handleDeleteClick(student) {
    setDeletingStudent(student);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingStudent) return;
    setSaving(true);
    try {
      await academicService.deleteStudent(deletingStudent._id);
      setDeleteDialogOpen(false);
      setDeletingStudent(null);
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // ==== Bulk Import Handlers ====
  function handleBulkAdd() {
    setBulkClassId('');
    setBulkData(null);
    setBulkErrors(null);
    setBulkSuccess('');
    setBulkDialogOpen(true);
  }

  function handleDownloadTemplate() {
    const wsData = [
      ['Nom', 'Prénom', 'Email', 'Numéro Inscription'],
      ['Ben Ali', 'Ahmed', 'ahmed.benali@iset.tn', '12345678'],
      ['Mansour', 'Sara', 'sara.m@iset.tn', '87654321']
    ];
    const ws = xlsx.utils.aoa_to_sheet(wsData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Template');
    xlsx.writeFile(wb, 'Template_Etudiants.xlsx');
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
        
        // Skip header row
        const rows = rawData.slice(1).filter(r => r.length > 0);
        
        const parsed = rows.map(r => ({
          lastName: r[0] ? String(r[0]).trim() : '',
          firstName: r[1] ? String(r[1]).trim() : '',
          email: r[2] ? String(r[2]).trim() : '',
          registrationNumber: r[3] ? String(r[3]).trim() : '',
        })).filter(s => s.firstName || s.lastName || s.email);

        if (parsed.length === 0) {
          setBulkErrors(['Le fichier semble vide ou mal formaté.']);
          setBulkData(null);
        } else {
          setBulkData(parsed);
          setBulkErrors(null);
          setBulkSuccess('');
        }
      } catch (err) {
        setBulkErrors(['Erreur lors de la lecture du fichier.']);
      }
    };
    reader.readAsBinaryString(file);
  }

  async function handleBulkSubmit() {
    if (!bulkClassId) {
      setBulkErrors(['Veuillez sélectionner une classe.']);
      return;
    }
    if (!bulkData || bulkData.length === 0) {
      setBulkErrors(['Aucune donnée à importer.']);
      return;
    }

    setSaving(true);
    setBulkErrors(null);
    setBulkSuccess('');

    try {
      const response = await departmentService.addBulkStudents(bulkClassId, bulkData);
      setBulkSuccess(response.message);
      if (response.errors && response.errors.length > 0) {
        setBulkErrors(response.errors);
      } else {
        setBulkData(null);
        setTimeout(() => setBulkDialogOpen(false), 2000);
      }
      setLoading(true);
      await fetchData();
    } catch (err) {
      setBulkErrors([err.response?.data?.message || 'Erreur lors de l\'importation en masse.']);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={32} className="text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Users size={24} className="text-accent" /> Mes Étudiants
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gérez les {students.length} étudiants inscrits dans votre département
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <Button onClick={handleBulkAdd} variant="outline" className="border-accent text-accent hover:bg-accent/10 dark:hover:bg-accent/20 rounded-xl gap-2 font-bold shadow-sm">
            <FileSpreadsheet size={16} /> Importer Excel
          </Button>
          <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-md shadow-accent/20 gap-2 font-bold">
            <Plus size={16} /> Ajouter
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Rechercher par nom ou numéro..."
            className="pl-9 placeholder:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Class Filter */}
        <div className="w-full md:w-48">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-accent hover:text-accent transition-colors">
              {selectedClass === 'ALL' ? 'Toutes les classes' : classes.find(c => c._id === selectedClass)?.name}
              <ChevronDown size={16} className="text-slate-400 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 max-h-80 overflow-y-auto rounded-xl shadow-xl border-slate-100 dark:border-slate-700 p-1 bg-white dark:bg-slate-900">
              <DropdownMenuItem
                onClick={() => setSelectedClass('ALL')}
                className={`rounded-lg cursor-pointer px-3 py-2 text-sm font-medium ${selectedClass === 'ALL' ? 'bg-accent/10 text-accent font-bold' : 'text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800'}`}
              >
                Toutes les classes
              </DropdownMenuItem>
              {classes.map(cls => (
                <DropdownMenuItem
                  key={cls._id}
                  onClick={() => setSelectedClass(cls._id)}
                  className={`rounded-lg cursor-pointer px-3 py-2 text-sm font-medium ${selectedClass === cls._id ? 'bg-accent/10 text-accent font-bold' : 'text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800'}`}
                >
                  {cls.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Directory Table/List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Aucun étudiant ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Étudiant</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">N° Inscription</th>
                  <th className="px-6 py-4">Classe</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-accent/20 to-accent/10 flex items-center justify-center border border-accent/20">
                          <UserIcon size={16} className="text-accent" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail size={14} className="opacity-70" />
                        <span className="font-medium text-xs font-mono">{student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        <Hash size={14} className="text-teal-500" />
                        {student.registrationNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-2.5 py-1">
                        <School size={12} className="mr-1.5 opacity-60" />
                        {student.className}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(student)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500 transition-colors" title="Modifier">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDeleteClick(student)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 transition-colors" title="Supprimer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Modifiez les informations de l\'étudiant.' : 'Remplissez les informations du nouvel étudiant.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 font-medium">{error}</div>}
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">N° Inscription</label>
              <Input value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} placeholder="Ex: 12345678" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Classe</label>
              <select value={form.classId} onChange={handleClassChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                <option value="">— Aucune classe —</option>
                {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2">
              {saving ? 'Enregistrement...' : (editingStudent ? 'Mettre à jour' : 'Ajouter')}
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
              Voulez-vous vraiment supprimer <span className="font-bold text-slate-700">{deletingStudent?.firstName} {deletingStudent?.lastName}</span> ?
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

      {/* Bulk Import Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="text-accent" size={20} />
              Importer des Étudiants via Excel
            </DialogTitle>
            <DialogDescription>
              Ajoutez plusieurs étudiants en classe d'un seul coup en utilisant un fichier Excel (.xlsx ou .csv).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* 1. Class Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">1. Choisir la classe de destination *</label>
              <select 
                value={bulkClassId} 
                onChange={e => setBulkClassId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm"
              >
                <option value="">— Veuillez choisir une classe —</option>
                {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.name}</option>)}
              </select>
            </div>

            {/* 2. Download Template */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Modèle de Fichier Excel</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Assurez-vous de respecter les noms des colonnes.</p>
              </div>
              <Button onClick={handleDownloadTemplate} variant="outline" size="sm" className="rounded-lg gap-2 text-xs">
                <Download size={14} /> Modèle
              </Button>
            </div>

            {/* 3. Upload File */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">3. Charger votre fichier rempli</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
                  disabled={saving}
                />
                <div className={`p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${bulkData ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 group-hover:border-accent group-hover:bg-accent/5'}`}>
                  {bulkData ? (
                    <>
                      <FileSpreadsheet size={32} className="text-emerald-500 mb-2" />
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{bulkData.length} étudiants prêts à être importés</p>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-400 mb-2 group-hover:text-accent transition-colors" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Cliquez ou glissez votre fichier ici</p>
                      <p className="text-[11px] text-slate-500 mt-1">Formats acceptés : .xlsx, .xls, .csv</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Messages */}
            {bulkErrors && Array.isArray(bulkErrors) && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl p-4 max-h-32 overflow-y-auto">
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">Problèmes détectés :</p>
                <ul className="list-disc pl-4 text-[11px] text-rose-600 dark:text-rose-300 space-y-1">
                  {bulkErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {bulkSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {bulkSuccess}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)} className="rounded-xl">Fermer</Button>
            <Button 
              onClick={handleBulkSubmit} 
              disabled={saving || !bulkData || bulkData.length === 0 || !bulkClassId} 
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2 font-bold"
            >
              {saving ? <LoadingSpinner size={16} /> : <Upload size={16} />} 
              {saving ? 'Importation...' : 'Valider l\'importation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
