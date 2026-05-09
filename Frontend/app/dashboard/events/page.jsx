'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { eventService } from '@/services/eventService';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Trash2, X, MapPin, Clock, Users, Image as ImageIcon, FileText, Paperclip } from 'lucide-react';

const TYPE_COLORS = { academic: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800', exam: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800', holiday: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800', event: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800', deadline: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' };

const EVENT_TYPES = ['academic', 'exam', 'holiday', 'event', 'deadline'];

const TYPE_LABELS = {
  academic: 'Académique',
  exam: 'Examen',
  holiday: 'Congé',
  event: 'Événement',
  deadline: 'Échéance'
};

export default function EventsPage() {
  const { user } = useAuth();
  const isAuthorized = user?.role === 'CHEF_DEPT' || user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', startDate: '', endDate: '', type: 'event', location: '', audience: ['all'] });
  const [files, setFiles] = useState({ image: null, document: null });
  
  const getImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    async function fetchData() {
      try { setEvents(await eventService.getEvents(typeFilter)); }
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
      data.append('description', formData.description);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('type', formData.type);
      data.append('location', formData.location);
      data.append('audience', JSON.stringify(formData.audience));
      
      if (files.image) data.append('image', files.image);
      if (files.document) data.append('document', files.document);

      await eventService.createEvent(data);
      setEvents(await eventService.getEvents(typeFilter));
      setShowForm(false);
      setFormData({ title: '', description: '', startDate: '', endDate: '', type: 'event', location: '', audience: ['all'] });
      setFiles({ image: null, document: null });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try { await eventService.deleteEvent(id); setEvents(events.filter(e => e._id !== id)); }
    catch (err) { console.error(err); }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Calendar size={24} className="text-accent" /> Événements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Calendrier des événements académiques</p>
        </div>
        {isAuthorized && (
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Créer</>}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map(type => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              typeFilter === type ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}>{TYPE_LABELS[type]}</button>
        ))}
      </div>

      {showForm && isAuthorized && (
        <Card className="animate-scale-in border-2 border-accent">
          <CardHeader className="pb-3"><CardTitle className="text-[15px]">Nouvel Événement</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Titre" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="md:col-span-2" required />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-sm" required />
              <div className="space-y-1.5"><label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Début</label><Input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className="dark:color-scheme-dark" /></div>
              <div className="space-y-1.5"><label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fin</label><Input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required className="dark:color-scheme-dark" /></div>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                <option value="academic">Académique</option><option value="exam">Examen</option><option value="event">Événement</option><option value="holiday">Congé</option><option value="deadline">Échéance</option>
              </select>
              <Input placeholder="Lieu" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              
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
              
              <div className="md:col-span-2 mt-4"><Button type="submit" variant="accent">Créer l&apos;événement</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 stagger-children">
        {events.map((event) => (
          <Card key={event._id} className="card-interactive border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-lg font-extrabold text-accent leading-none">{new Date(event.startDate).getDate()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(event.startDate).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">{event.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                      {event.location && <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>}
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(event.startDate)}</span>
                    </div>
                    
                    {event.image && (
                      <div className="mt-4 h-32 w-full max-w-sm rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    {event.document && (
                      <a href={getImageUrl(event.document)} target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 items-center gap-1.5 text-xs text-accent hover:text-accent/80 hover:underline bg-accent/10 px-3 py-1.5 rounded-full font-medium transition-colors">
                        <Paperclip size={14} /> Pièce jointe
                      </a>
                    )}
                    
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-[10px] ${TYPE_COLORS[event.type] || 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>{TYPE_LABELS[event.type] || event.type}</Badge>
                  {isAuthorized && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(event._id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {events.length === 0 && (
        <div className="text-center py-16"><Calendar size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-400 text-sm">Aucun événement</p></div>
      )}
    </div>
  );
}
