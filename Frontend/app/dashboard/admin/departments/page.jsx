'use client'; // Enable client-side rendering and local React state interactions

import { useState, useEffect } from 'react'; // React hooks for managing state and mount callbacks
import { Card, CardContent } from '@/components/ui/card'; // Card block wrapper components
import { Badge } from '@/components/ui/badge'; // Badge UI element
import { Button } from '@/components/ui/button'; // Button layout component
import { Input } from '@/components/ui/input'; // Text input form field
import { LoadingPage } from '@/components/ui/loading'; // Loading animation spinner page
import { departmentService } from '@/services/departmentService'; // API services module for department CRUD endpoints
import { Building2, Plus, Edit, Trash2, Search, Mail, User } from 'lucide-react'; // Action and detail display icons
import { PortalModal } from '@/components/ui/portal-modal'; // Overlay modal window component

// Main Component to view, query, and manage academy departments
export default function DepartmentsManager() {
  const [departments, setDepartments] = useState([]); // List of departments retrieved from server database
  const [loading, setLoading] = useState(true); // Tracking loading status
  const [search, setSearch] = useState(''); // User query string for filtering departments list
  
  // Modal state variables for creating or updating departments
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls overlay window display visibility
  const [formData, setFormData] = useState({ name: '', description: '', head: '', headEmail: '' }); // Form input fields object template
  const [editingId, setEditingId] = useState(null); // Reference to department id currently selected for update

  // Async task to fetch departments list from backend server
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

  // Run database fetch query once during component initial mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter department list dynamically based on search query matching name or head name
  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  // Trigger modal display in creation mode (clears prefilled input states)
  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', head: '', headEmail: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Trigger modal display in update mode with prefilled target info
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

  // Perform delete request call on selected department ID with browser confirmation
  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce département ? Cela ne supprimera pas les utilisateurs associés mais rompra les liens.')) {
      try {
        await departmentService.deleteDepartment(id);
        fetchData(); // Reload list after removal completes
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Save new department or commit existing changes back to backend server database
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Run update query if id reference is set
        await departmentService.updateDepartment(editingId, formData);
      } else {
        // Run creation request if no id is specified
        await departmentService.createDepartment(formData);
      }
      setIsModalOpen(false); // Close dialog window
      fetchData(); // Refresh list contents
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde.');
    }
  };

  // Show page spinner if initial request is pending and list is empty
  if (loading && departments.length === 0) return <LoadingPage />;

  return (
    // Component layout frame
    <div className="space-y-6">
      
      {/* Header section containing title description and Add CTA button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Building2 size={24} className="text-accent" /> Départements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Gérez les départements de l&apos;ISET Gafsa.</p>
        </div>
        {/* Trigger addition form */}
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-accent/20">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Dynamic input search bar filtering list contents */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input 
          placeholder="Rechercher un département..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-10 w-full" 
        />
      </div>

      {/* Render matching departments in cards grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => (
          // Individual department status card
          <Card key={dept._id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Colorful top border effect */}
            <div className="h-1.5 w-full bg-accent/20 group-hover:bg-accent transition-colors" />
            <CardContent className="p-5">
              
              {/* Card Title and Action Buttons (Edit and Delete options) */}
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
              
              {/* Description body */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                {dept.description || 'Aucune description'}
              </p>
              
              {/* Direct coordinates of department head details */}
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
              
              {/* Teachers and Classes count badges mapping */}
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

      {/* Modal Dialog layout used to add or modify department settings */}
      <PortalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold">{editingId ? 'Modifier' : 'Ajouter'} un Département</h2>
        </div>
        {/* Department details form fields */}
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
          {/* Action trigger buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" variant="accent">Enregistrer</Button>
          </div>
        </form>
      </PortalModal>
    </div>
  );
}
