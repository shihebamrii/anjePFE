'use client';

// Import state, lifecycle, and computation caching hooks from React
import { useState, useEffect, useMemo } from 'react';
// Import container card components
import { Card, CardContent } from '@/components/ui/card';
// Import UI badges to highlight labels
import { Badge } from '@/components/ui/badge';
// Import standard page loader
import { LoadingPage } from '@/components/ui/loading';
// Import userService APIs for CRUD operations on accounts
import { userService } from '@/services/userService';
// Import departmentService APIs to assign users to specific departments
import { departmentService } from '@/services/departmentService';
// Import avatar fallback wrappers for user profile initials
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// Import avatar initials helper
import { getInitials } from '@/lib/utils';
// Import Lucide icons for buttons and search inputs
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
// Import generic styled Input field
import { Input } from '@/components/ui/input';
// Import Portal modal component to render slide-in forms in a React portal overlay
import { PortalModal } from '@/components/ui/portal-modal';

// UsersManager component to list, filter, create, edit, and delete user profiles
export default function UsersManager({ roleFilter, title, description, badgeIcon: BadgeIcon }) {
  // State storing the list of user profile documents
  const [users, setUsers] = useState([]);
  // State storing all available university departments
  const [departments, setDepartments] = useState([]);
  // Loading state to toggle overlay loaders
  const [loading, setLoading] = useState(true);
  
  // Filtering States: search input, selected department filter, status filter
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Input fields form states
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: roleFilter, department: '', isActive: true });
  // Tracks user ID currently being edited (null when creating a new user)
  const [editingId, setEditingId] = useState(null);

  // Fetch users list and departments concurrently from the backend APIs
  const fetchData = async () => {
    setLoading(true);
    try { 
      const [usersData, deptsData] = await Promise.all([
        userService.getUsers(roleFilter),
        departmentService.getAllDepartments()
      ]);
      setUsers(usersData);
      setDepartments(deptsData);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Re-fetch users list whenever the role filter parameter changes
  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  // Helper function: gets department name by ID, returns fallback if not found
  const getDeptName = (deptId) => {
    if (!deptId) return '—';
    const dept = departments.find(d => d._id === deptId);
    return dept ? dept.name : deptId;
  };

  // Helper function: returns Tailwind styling configurations matching the user's role badge
  const getRoleBadge = (role) => {
    const configs = {
      ADMIN: { label: 'Admin', class: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400' },
      TEACHER: { label: 'Enseignant', class: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400' },
      STUDENT: { label: 'Étudiant', class: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400' },
      CHEF_DEPT: { label: 'Chef Dép.', class: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400' },
      PARTNER: { label: 'Partenaire', class: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400' },
    };
    return configs[role] || { label: role, class: 'bg-slate-50 text-slate-700 border-slate-100' };
  };

  // Computed filter logic: memoized search queries and selections filtering the users list in real-time
  const filtered = useMemo(() => {
    return users.filter(u => {
      // Check if user's first/last name or email matches search query
      const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
      // Check if department filter matches
      const matchesDept = deptFilter ? u.department === deptFilter : true;
      // Check if account status matches (active/inactive)
      const matchesStatus = statusFilter === '' ? true : String(u.isActive !== false) === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [users, search, deptFilter, statusFilter]);

  // Open the create user modal dialog with blank form values
  const handleOpenAdd = () => {
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: roleFilter || 'STUDENT', department: '', isActive: true });
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Open the edit modal pre-loaded with current user profile values
  const handleOpenEdit = (user) => {
    setFormData({ 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email, 
      password: '', // Blank password field by default (so password won't change unless typed)
      role: user.role, 
      department: user.department || '',
      isActive: user.isActive !== false
    });
    setEditingId(user._id);
    setIsModalOpen(true);
  };

  // Delete user trigger: displays browser double-check confirmation prompt before execution
  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(id);
        fetchData(); // Reload list
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Save changes to database: handles both update and create API calls
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // If editingId exists, perform PUT update
        await userService.updateUser(editingId, formData);
      } else {
        // Else, perform POST creation
        await userService.createUser(formData);
      }
      setIsModalOpen(false); // Close dialog
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde. Cet email est peut-être déjà utilisé.');
    }
  };

  // Display fullscreen loader overlay if list is empty and initial load is in progress
  if (loading && users.length === 0) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header section with titles and Add User trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            {BadgeIcon && <BadgeIcon size={24} className="text-accent" />} {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{description}</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-accent/20">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Advanced Filter Inputs bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        {/* Search query input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input 
            placeholder="Rechercher par nom ou email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10 w-full bg-slate-50 dark:bg-slate-800/50 border-none" 
          />
        </div>
        
        {/* Dropdowns filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          {/* Department filter selection */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="flex-1 md:w-48 bg-slate-50 dark:bg-slate-800/50 border-none text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="">Tous les départements</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>

          {/* Active Status filter selection */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-36 bg-slate-50 dark:bg-slate-800/50 border-none text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="">Tous statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </div>

      {/* Users List Data Table Grid */}
      <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  {!roleFilter && <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rôle</th>}
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Département</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Avatar & Full name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                            <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {getInitials(u.firstName, u.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {u.firstName} {u.lastName}
                          </span>
                        </div>
                      </td>
                      {/* Email address */}
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                      {/* Role label badge (only shown if managing all users together) */}
                      {!roleFilter && (
                        <td className="p-4">
                          <Badge variant="outline" className={`${roleBadge.class} text-[10px] border px-2 py-0.5`}>
                            {roleBadge.label}
                          </Badge>
                        </td>
                      )}
                      {/* Department label */}
                      <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">
                        {getDeptName(u.department)}
                      </span>
                    </td>
                    {/* Active account status */}
                    <td className="p-4">
                      <Badge variant={u.isActive !== false ? 'success' : 'danger'} className="text-[10px] px-2 py-0.5">
                        {u.isActive !== false ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    {/* Edit / Delete Action buttons */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenEdit(u)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Modifier">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            {/* Empty state alert when filtering returns no results */}
            {filtered.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Search size={32} className="mb-3 opacity-20" />
                <p className="text-sm">Aucun résultat trouvé pour vos filtres.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Counters display footer */}
      <p className="text-xs text-slate-400 text-center">{filtered.length} profil(s) affiché(s)</p>

      {/* CRUD Form Modal overlay */}
      <PortalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* Title header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {editingId ? <Edit className="text-blue-500" size={20} /> : <Plus className="text-accent" size={20} />}
            {editingId ? 'Modifier le profil' : 'Ajouter un profil'}
          </h2>
        </div>
        
        {/* Form elements container */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last name inputs grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Prénom</label>
                <Input required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-white dark:bg-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nom</label>
                <Input required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-white dark:bg-slate-900" />
              </div>
            </div>
            
            {/* Email input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white dark:bg-slate-900" />
            </div>

            {/* Role dropdown select input (only if role isn't locked by roleFilter prop) */}
            {!roleFilter && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                >
                  <option value="STUDENT">Étudiant</option>
                  <option value="TEACHER">Enseignant</option>
                  <option value="CHEF_DEPT">Chef de Département</option>
                  <option value="PARTNER">Partenaire</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            )}
            
            {/* Password input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Mot de passe {editingId && <span className="lowercase font-normal text-slate-400">(laisser vide pour ne pas modifier)</span>}
              </label>
              <Input type="password" required={!editingId} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-white dark:bg-slate-900" />
            </div>
            
            {/* Department and Active status inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Département</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                >
                  <option value="">Aucun</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Statut</label>
                <select
                  value={String(formData.isActive)}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>
            
            {/* Action buttons footer */}
            <div className="flex gap-3 justify-end pt-4 mt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent shadow-md shadow-accent/20 hover:bg-accent/90 transition-colors">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </PortalModal>
    </div>
  );
}
