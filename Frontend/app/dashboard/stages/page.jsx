'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { stageService } from '@/services/stageService';
import { formatDate, getStageTypeBadge, getStageStatusBadge } from '@/lib/utils';
import { Briefcase, Plus, Trash2, X, MapPin, Clock, Mail, ChevronDown, ChevronUp, Image as ImageIcon, FileText, Paperclip } from 'lucide-react';

const STAGE_TYPES = ['', 'PFE', 'OUVRIER', 'PERFECTIONNEMENT', 'SUMMER'];
const TYPE_LABELS = { '': 'Tout', PFE: 'PFE', OUVRIER: 'Ouvrier', PERFECTIONNEMENT: 'Perfectionnement', SUMMER: 'Été' };

export default function StagesPage() {
  const { user } = useAuth();
  const isAuthorized = user?.role === 'CHEF_DEPT' || user?.role === 'ADMIN' || user?.role === 'PARTNER';
  const canManage = isAuthorized;
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({
    title: '', companyName: '', location: '', duration: '', type: 'PFE',
    description: '', contactEmail: '', deadline: '', requirements: ''
  });
  const [files, setFiles] = useState({ image: null, document: null });

  const getImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    async function fetchData() {
      try { setStages(await stageService.getStages(typeFilter)); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    setLoading(true);
    fetchData();
  }, [typeFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('companyName', formData.companyName);
      data.append('location', formData.location);
      data.append('duration', formData.duration);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('contactEmail', formData.contactEmail);
      data.append('deadline', formData.deadline);
      const reqArray = formData.requirements.split(',').map(r => r.trim()).filter(Boolean);
      data.append('requirements', JSON.stringify(reqArray));
      
      if (files.image) data.append('image', files.image);
      if (files.document) data.append('document', files.document);

      await stageService.createStage(data);
      setStages(await stageService.getStages(typeFilter));
      setShowForm(false);
      setFormData({ title: '', companyName: '', location: '', duration: '', type: 'PFE', description: '', contactEmail: '', deadline: '', requirements: '' });
      setFiles({ image: null, document: null });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return;
    try { await stageService.deleteStage(id); setStages(stages.filter(s => s._id !== id)); }
    catch (err) { console.error(err); }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Briefcase size={24} className="text-accent" /> Offres de Stage
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Découvrez les opportunités disponibles</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Publier</>}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STAGE_TYPES.map(type => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              typeFilter === type ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}>{TYPE_LABELS[type]}</button>
        ))}
      </div>

      {showForm && canManage && (
        <Card className="animate-scale-in border-2 border-accent">
          <CardHeader className="pb-3"><CardTitle className="text-[15px]">Nouvelle Offre</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Titre du poste" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="md:col-span-2" required />
              <Input placeholder="Entreprise" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
              <Input placeholder="Localisation" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              <Input placeholder="Durée" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required />
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                <option value="PFE">PFE</option><option value="OUVRIER">Ouvrier</option><option value="PERFECTIONNEMENT">Perfectionnement</option><option value="SUMMER">Été</option>
              </select>
              <Input type="email" placeholder="Email de contact" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} required />
              <div className="space-y-1.5"><label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date limite</label><Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required /></div>
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-sm" required />
              <Input placeholder="Compétences (séparées par virgule)" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="md:col-span-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-800 p-4 rounded-xl md:col-span-2 mt-2">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <ImageIcon size={16} className="text-accent" /> Ajouter une image
                  </label>
                  <Input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, image: e.target.files[0] })} className="file:bg-accent/10 file:text-accent file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FileText size={16} className="text-accent" /> Ajouter un document (PDF/Word)
                  </label>
                  <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFiles({ ...files, document: e.target.files[0] })} className="file:bg-accent/10 file:text-accent file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 text-sm" />
                </div>
              </div>
              
              <div className="md:col-span-2 mt-4"><Button type="submit" variant="accent">Publier l&apos;offre</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 stagger-children">
        {stages.map((stage) => {
          const typeBadge = getStageTypeBadge(stage.type);
          const statusBadge = getStageStatusBadge(stage.status);
          const isExpanded = expanded === stage._id;
          return (
            <Card key={stage._id} className="card-interactive border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className={typeBadge.class + " text-[10px]"}>{typeBadge.label}</Badge>
                      <Badge className={statusBadge.class + " text-[10px]"}>{statusBadge.label}</Badge>
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">{stage.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stage.companyName}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {stage.location}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {stage.duration}</span>
                      <span className="flex items-center gap-1"><Mail size={12} /> {stage.contactEmail}</span>
                    </div>
                    <button onClick={() => setExpanded(isExpanded ? null : stage._id)}
                      className="flex items-center gap-1 mt-3 text-xs font-semibold text-accent hover:underline">
                      {isExpanded ? <><ChevronUp size={14} /> Moins</> : <><ChevronDown size={14} /> Plus de détails</>}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 animate-fade-in">
                        
                        {stage.image && (
                          <div className="mb-4 h-40 w-full max-w-sm rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img src={getImageUrl(stage.image)} alt={stage.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{stage.description}</p>
                        
                        {stage.document && (
                          <a href={getImageUrl(stage.document)} target="_blank" rel="noopener noreferrer" className="inline-flex mb-4 items-center gap-1.5 text-xs text-accent hover:text-accent/80 hover:underline bg-accent/10 px-3 py-1.5 rounded-full font-medium transition-colors">
                            <Paperclip size={14} /> Pièce jointe
                          </a>
                        )}
                        
                        {stage.requirements?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {stage.requirements.map((req, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">{req}</span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-3">Date limite: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(stage.deadline)}</span></p>
                      </div>
                    )}
                  </div>
                  {canManage && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0" onClick={() => handleDelete(stage._id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {stages.length === 0 && (
        <div className="text-center py-16"><Briefcase size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-400 text-sm">Aucune offre disponible</p></div>
      )}
    </div>
  );
}
