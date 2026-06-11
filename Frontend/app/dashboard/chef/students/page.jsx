'use client'; // Tells Next.js to render this component on the client-side (in the browser)

import { useState, useEffect, useMemo } from 'react'; // React hooks for managing state, handling side effects, and caching calculated values
import { Card, CardContent } from '@/components/ui/card'; // Custom UI components for card container layouts
import { Badge } from '@/components/ui/badge'; // Custom UI component to display small badge/status pills
import { Input } from '@/components/ui/input'; // Custom UI text input field component
import { Button } from '@/components/ui/button'; // Custom UI clickable button component
import { LoadingSpinner } from '@/components/ui/loading'; // Custom loading spinner visual utility
import { academicService } from '@/services/academicService'; // Helper functions to send academic/student HTTP requests to the backend
import { departmentService } from '@/services/departmentService'; // Helper functions to send department and class-related HTTP requests
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'; // Modal window components for popups and overlay dialogs
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Dropdown menu components for selecting options
import { Users, Search, School, User as UserIcon, Mail, Hash, Plus, Pencil, Trash2, ChevronDown, Upload, FileSpreadsheet, Download } from 'lucide-react'; // Visual icon library elements
import * as xlsx from 'xlsx'; // Library used to parse uploaded Excel files and generate template downloads

// Default empty form template for adding or updating a student
const emptyForm = { firstName: '', lastName: '', email: '', registrationNumber: '', classId: '', className: '' };

export default function StudentsPage() {
  // --- React State Declarations ---
  const [students, setStudents] = useState([]); // Stores the list of all students fetched from the backend
  const [classes, setClasses] = useState([]); // Stores the list of academic classes belonging to the user's department
  const [loading, setLoading] = useState(true); // Tracks whether the page is fetching its initial data
  const [searchQuery, setSearchQuery] = useState(''); // Text entered by user to filter students by name or register number
  const [selectedClass, setSelectedClass] = useState('ALL'); // Tracks which class filter is active ('ALL' or a specific class ID)

  // --- Add/Edit/Delete Dialog States (CRUD) ---
  const [dialogOpen, setDialogOpen] = useState(false); // Controls visibility of the add/edit modal popup
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Controls visibility of the delete confirmation modal
  const [editingStudent, setEditingStudent] = useState(null); // Reference to the student currently being modified (null means adding new)
  const [deletingStudent, setDeletingStudent] = useState(null); // Reference to the student selected for deletion
  const [form, setForm] = useState(emptyForm); // Tracks form fields input values for the add/edit dialog
  const [saving, setSaving] = useState(false); // Indicates if an API save/delete request is actively processing
  const [error, setError] = useState(''); // Stores validation or server error messages to display inside the dialog

  // --- Bulk Excel Import States ---
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false); // Controls visibility of the Excel file import popup
  const [bulkClassId, setBulkClassId] = useState(''); // Tracks the target class ID to assign to the imported students
  const [bulkData, setBulkData] = useState(null); // Stores the rows of parsed student data ready to upload
  const [bulkErrors, setBulkErrors] = useState(null); // Stores validation error messages encountered during import
  const [bulkSuccess, setBulkSuccess] = useState(''); // Stores the success feedback message from the server

  // Fetch initial data once on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Retrieves students and department-specific classes from the API
  async function fetchData() {
    try {
      // Execute both API calls in parallel for better performance
      const [studentsData, deptsData] = await Promise.all([
        academicService.getStudents(),
        departmentService.getMyDepartment()
      ]);
      setStudents(studentsData); // Save the fetched student list to state
      
      // If department data exists, extract and sort its classes alphabetically
      if (deptsData && deptsData.length > 0) {
        const classList = deptsData[0].classes || [];
        setClasses(classList.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      console.error(err); // Log any fetching errors to the console
    } finally {
      setLoading(false); // Mark loading as finished to render the dashboard layout
    }
  }

  // Filter students array dynamically using search text and class filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Check if student first name, last name, or registration number contains the query
      const matchesSearch =
        student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registrationNumber?.includes(searchQuery);

      // Check if student belongs to the selected class filter
      const matchesClass = selectedClass === 'ALL' || student.classId === selectedClass;

      return matchesSearch && matchesClass; // Both conditions must match
    });
  }, [students, searchQuery, selectedClass]); // Re-calculate only when inputs change

  // Opens the dialog to add a new student, resetting form fields
  function handleAdd() {
    setEditingStudent(null); // Clear editing reference to flag a CREATE operation
    setForm(emptyForm); // Reset form values to blanks
    setError(''); // Clear any old error state
    setDialogOpen(true); // Open the modal window
  }

  // Opens the dialog to edit an existing student, pre-filling input fields
  function handleEdit(student) {
    setEditingStudent(student); // Save student reference to flag an UPDATE operation
    setForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      registrationNumber: student.registrationNumber || '',
      classId: student.classId || '',
      className: student.className || '',
    });
    setError(''); // Clear any old error state
    setDialogOpen(true); // Open the modal window
  }

  // Updates form state when the user selects a target class, syncing its ID and readable name
  function handleClassChange(e) {
    const classId = e.target.value;
    const cls = classes.find(c => c._id === classId); // Locate class object details from the state array
    setForm(f => ({ ...f, classId, className: cls?.name || '' })); // Sync the class identifier and string name
  }

  // Submits the CRUD form to either add a new student or update an existing one
  async function handleSave() {
    // Basic client-side validation check
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Nom, prénom et email sont requis.'); // Set visual error warning if fields are blank
      return;
    }
    setSaving(true); // Show loader inside button
    setError(''); // Clear past errors
    try {
      if (editingStudent) {
        // Perform PUT update request
        await academicService.updateStudent(editingStudent._id, form);
      } else {
        // Perform POST creation request
        await academicService.addStudent(form);
      }
      setDialogOpen(false); // Hide the popup form
      setLoading(true); // Put dashboard table into loading state
      await fetchData(); // Refresh the list from the server
    } catch (err) {
      // Capture and display error message sent by the backend
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false); // Turn off saving loader
    }
  }

  // Triggers delete confirmation modal for a specific student record
  function handleDeleteClick(student) {
    setDeletingStudent(student); // Cache the target student to delete
    setDeleteDialogOpen(true); // Open the safety alert dialog
  }

  // Confirms deletion request and contacts backend API
  async function handleDeleteConfirm() {
    if (!deletingStudent) return; // Exit if no target student is selected
    setSaving(true); // Set saving overlay loader state
    try {
      await academicService.deleteStudent(deletingStudent._id); // Delete from server database
      setDeleteDialogOpen(false); // Close modal prompt
      setDeletingStudent(null); // Clear selected student
      setLoading(true); // Reload dashboard state
      await fetchData(); // Fetch clean list from server
    } catch (err) {
      console.error(err); // Log deletion issues to developer tools console
    } finally {
      setSaving(false); // Remove loading state
    }
  }

  // ==== Bulk Import Excel File Handlers ====

  // Resets bulk import variables and opens bulk upload dialog
  function handleBulkAdd() {
    setBulkClassId('');
    setBulkData(null);
    setBulkErrors(null);
    setBulkSuccess('');
    setBulkDialogOpen(true);
  }

  // Generates and triggers downloading a demo template Excel spreadsheet
  function handleDownloadTemplate() {
    // Define columns layout and default sample row values
    const wsData = [
      ['Nom', 'Prénom', 'Email', 'Numéro Inscription'],
      ['Ben Ali', 'Ahmed', 'ahmed.benali@iset.tn', '12345678'],
      ['Mansour', 'Sara', 'sara.m@iset.tn', '87654321']
    ];
    const ws = xlsx.utils.aoa_to_sheet(wsData); // Convert array of arrays to Excel sheet model
    const wb = xlsx.utils.book_new(); // Create virtual workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Template'); // Append sheet tab
    xlsx.writeFile(wb, 'Template_Etudiants.xlsx'); // Trigger automatic browser file download
  }

  // Parses the user-uploaded Excel spreadsheet file using FileReader and the sheetjs parser
  function handleFileUpload(e) {
    const file = e.target.files[0]; // Retrieve upload file reference
    if (!file) return;

    const reader = new FileReader(); // Instantiate file reader api
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result; // Read binary output contents
        const wb = xlsx.read(bstr, { type: 'binary' }); // Read XLSX structure
        const wsname = wb.SheetNames[0]; // Get the first sheet name tab
        const ws = wb.Sheets[wsname]; // Extract first spreadsheet object
        const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 }); // Parse sheet rows into array format
        
        // Skip the header row to extract data rows
        const rows = rawData.slice(1).filter(r => r.length > 0);
        
        // Map excel cell indexes to students properties object structures
        const parsed = rows.map(r => ({
          lastName: r[0] ? String(r[0]).trim() : '',
          firstName: r[1] ? String(r[1]).trim() : '',
          email: r[2] ? String(r[2]).trim() : '',
          registrationNumber: r[3] ? String(r[3]).trim() : '',
        })).filter(s => s.firstName || s.lastName || s.email); // Only keep records that are not entirely empty

        if (parsed.length === 0) {
          setBulkErrors(['Le fichier semble vide ou mal formaté.']); // Validation error warning
          setBulkData(null);
        } else {
          setBulkData(parsed); // Save parsed list to temporary upload queue
          setBulkErrors(null);
          setBulkSuccess('');
        }
      } catch (err) {
        setBulkErrors(['Erreur lors de la lecture du fichier.']); // Handle parser parsing errors
      }
    };
    reader.readAsBinaryString(file); // Initiate reading file as binary bytes
  }

  // Sends the parsed list of students to the backend to bulk register them to the chosen class ID
  async function handleBulkSubmit() {
    if (!bulkClassId) {
      setBulkErrors(['Veuillez sélectionner une classe.']); // Error out if class selection is missing
      return;
    }
    if (!bulkData || bulkData.length === 0) {
      setBulkErrors(['Aucune donnée à importer.']); // Error out if no file was uploaded
      return;
    }

    setSaving(true);
    setBulkErrors(null);
    setBulkSuccess('');

    try {
      // Post request containing targeted class selection ID and the students rows list
      const response = await departmentService.addBulkStudents(bulkClassId, bulkData);
      setBulkSuccess(response.message); // Set success status message
      
      // If some rows generated duplicate record database errors
      if (response.errors && response.errors.length > 0) {
        setBulkErrors(response.errors); // Display detailed report rows warnings
      } else {
        setBulkData(null); // Clear buffer
        setTimeout(() => setBulkDialogOpen(false), 2000); // Automatically close modal after timer
      }
      setLoading(true);
      await fetchData(); // Refresh local list
    } catch (err) {
      // Capture and show backend server import issues
      setBulkErrors([err.response?.data?.message || 'Erreur lors de l\'importation en masse.']);
    } finally {
      setSaving(false); // Stop loading indicator
    }
  }

  // Display loading screen if the page is retrieving data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={32} className="text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with page title and primary buttons */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Users size={24} className="text-accent" /> Mes Étudiants
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gérez les {students.length} étudiants inscrits dans votre département
          </p>
        </div>

        {/* Buttons to trigger single creation form or bulk Excel upload flow */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <Button onClick={handleBulkAdd} variant="outline" className="border-accent text-accent hover:bg-accent/10 dark:hover:bg-accent/20 rounded-xl gap-2 font-bold shadow-sm">
            <FileSpreadsheet size={16} /> Importer Excel
          </Button>
          <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-md shadow-accent/20 gap-2 font-bold">
            <Plus size={16} /> Ajouter
          </Button>
        </div>
      </div>

      {/* Filter and Search controls toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input Box */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Rechercher par nom ou numéro..."
            className="pl-9 placeholder:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdown Menu class selection filter */}
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

      {/* Directory Table/List Grid container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          // Display placeholder empty view if filters yield no student rows
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Aucun étudiant ne correspond à vos critères.</p>
          </div>
        ) : (
          // Render data list table
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
                    {/* Student Full Name & Profile Icon Column */}
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
                    {/* Contact Email Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail size={14} className="opacity-70" />
                        <span className="font-medium text-xs font-mono">{student.email}</span>
                      </div>
                    </td>
                    {/* Unique Registration Code Code Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        <Hash size={14} className="text-teal-500" />
                        {student.registrationNumber}
                      </div>
                    </td>
                    {/* Class badge Column */}
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-2.5 py-1">
                        <School size={12} className="mr-1.5 opacity-60" />
                        {student.className}
                      </Badge>
                    </td>
                    {/* Trigger actions column (Edit/Delete icons buttons) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(student)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500 transition-colors" title="Modifier">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDeleteClick(student)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors" title="Supprimer">
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

      {/* Add / Edit Student Dialog Popup Container */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Modifiez les informations de l\'étudiant.' : 'Remplissez les informations du nouvel étudiant.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Display validation warning alert box */}
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-medium">{error}</div>}
            
            {/* Input fields grid block for Names */}
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

            {/* Email input field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>

            {/* Registration code input field */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">N° Inscription</label>
              <Input value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} placeholder="Ex: 12345678" />
            </div>

            {/* Target Class selection picker */}
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

      {/* Delete Record Safety Confirmation Dialog */}
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
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              {saving ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Excel Sheet Upload / Import Modal */}
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
            {/* 1. Destination target Class Picker */}
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

            {/* 2. Download sample reference Excel Sheet file button */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Modèle de Fichier Excel</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Assurez-vous de respecter les noms des colonnes.</p>
              </div>
              <Button onClick={handleDownloadTemplate} variant="outline" size="sm" className="rounded-lg gap-2 text-xs">
                <Download size={14} /> Modèle
              </Button>
            </div>

            {/* 3. Drag and Drop upload block file system listener */}
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
                {/* Dynamically adjust drag-and-drop borders and colors depending on state file check */}
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

            {/* Render validation error messages reporting lists of invalid rows */}
            {bulkErrors && Array.isArray(bulkErrors) && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 max-h-32 overflow-y-auto">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2">Problèmes détectés :</p>
                <ul className="list-disc pl-4 text-[11px] text-red-600 dark:text-red-300 space-y-1">
                  {bulkErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Display success feedback text */}
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
