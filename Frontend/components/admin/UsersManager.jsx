'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { userService } from '@/services/userService';
import { departmentService } from '@/services/departmentService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UsersManager({ roleFilter, title, description, badgeIcon: BadgeIcon }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: roleFilter, department: '', isActive: true });
  const [editingId, setEditingId] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  // Helper to get department name
  const getDeptName = (deptId) => {
    if (!deptId) return '—';
    const dept = departments.find(d => d._id === deptId);
    return dept ? dept.name : deptId;
  };

  // Filtered logic
  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter ? u.department === deptFilter : true;
      const matchesStatus = statusFilter === '' ? true : String(u.isActive !== false) === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [users, search, deptFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: roleFilter, department: '', isActive: true });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({ 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email, 
      password: '', 
      role: user.role, 
      department: user.department || '',
      isActive: user.isActive !== false
    });
    setEditingId(user._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await userService.updateUser(editingId, formData);
      } else {
        await userService.createUser(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde. Cet email est peut-être déjà utilisé.');
    }
  };

  if (loading && users.length === 0) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input 
            placeholder="Rechercher par nom ou email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10 w-full bg-slate-50 dark:bg-slate-800/50 border-none" 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
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

      {/* Table */}
      <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Département</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
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
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">
                        {getDeptName(u.department)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.isActive !== false ? 'success' : 'danger'} className="text-[10px] px-2 py-0.5">
                        {u.isActive !== false ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
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
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Search size={32} className="mb-3 opacity-20" />
                <p className="text-sm">Aucun résultat trouvé pour vos filtres.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <p className="text-xs text-slate-400 text-center">{filtered.length} profil(s) affiché(s)</p>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingId ? <Edit className="text-blue-500" size={20} /> : <Plus className="text-accent" size={20} />}
                {editingId ? 'Modifier le profil' : 'Ajouter un profil'}
              </h2>
            </div>
            
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                  <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white dark:bg-slate-900" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Mot de passe {editingId && <span className="lowercase font-normal text-slate-400">(laisser vide pour ne pas modifier)</span>}
                  </label>
                  <Input type="password" required={!editingId} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-white dark:bg-slate-900" />
                </div>
                
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
          </div>
        </div>
      )}
    </div>
  );
}
