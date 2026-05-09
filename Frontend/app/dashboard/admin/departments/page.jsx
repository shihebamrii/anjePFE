'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { departmentService } from '@/services/departmentService';
import { Building2, Plus, Edit, Trash2, Search, Mail, User } from 'lucide-react';

export default function DepartmentsManager() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', head: '', headEmail: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { 
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', head: '', headEmail: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setFormData({ 
      name: dept.name, 
      description: dept.description || '', 
      head: dept.head, 
      headEmail: dept.headEmail || '' 
    });
    setEditingId(dept._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce département ? Cela ne supprimera pas les utilisateurs associés mais rompra les liens.')) {
      try {
        await departmentService.deleteDepartment(id);
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
        await departmentService.updateDepartment(editingId, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde.');
    }
  };

  if (loading && departments.length === 0) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Building2 size={24} className="text-accent" /> Départements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Gérez les départements de l&apos;ISET Gafsa.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-accent/20">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input 
          placeholder="Rechercher un département..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-10 w-full" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => (
          <Card key={dept._id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="h-1.5 w-full bg-accent/20 group-hover:bg-accent transition-colors" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{dept.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(dept)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(dept._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                {dept.description || 'Aucune description'}
              </p>
              
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <User size={12} className="text-slate-400" />
                  <span className="font-semibold">Chef :</span> {dept.head}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Mail size={12} className="text-slate-400" />
                  {dept.headEmail}
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {dept.teacherCount} Enseignants
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {dept.classCount} Classes
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold">{editingId ? 'Modifier' : 'Ajouter'} un Département</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nom du département</label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                <textarea 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm min-h-[100px]"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nom du Chef</label>
                <Input required value={formData.head} onChange={(e) => setFormData({...formData, head: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email du Chef</label>
                <Input type="email" required value={formData.headEmail} onChange={(e) => setFormData({...formData, headEmail: e.target.value})} />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" variant="accent">Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
