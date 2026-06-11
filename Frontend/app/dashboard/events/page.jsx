'use client'; // Directs Next.js to render this file on the client-side (in the browser)

import { useState, useEffect } from 'react'; // React hooks for managing state and handling side effects
import { useAuth } from '@/context/AuthContext'; // Custom hook to access logged in user variables and status
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // custom UI layout components for cards
import { Badge } from '@/components/ui/badge'; // custom UI badge pill components
import { Button } from '@/components/ui/button'; // custom UI clickable buttons
import { Input } from '@/components/ui/input'; // custom UI input fields
import { LoadingPage } from '@/components/ui/loading'; // custom loading page transition component
import { eventService } from '@/services/eventService'; // Helper methods to contact events APIs on backend
import { formatDate } from '@/lib/utils'; // Date formatting helper function
import { Calendar, Plus, Trash2, X, MapPin, Clock, Users, Image as ImageIcon, FileText, Paperclip } from 'lucide-react'; // Vector icons assets

// Styling mapper assigning custom Tailwind colors to each category classification
const TYPE_COLORS = { 
  academic: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800', 
  exam: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800', 
  holiday: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800', 
  event: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800', 
  deadline: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' 
};

// Array of string keys defining possible event types
const EVENT_TYPES = ['academic', 'exam', 'holiday', 'event', 'deadline'];

// Translates event classification database keys to user-facing French text labels
const TYPE_LABELS = {
  academic: 'Académique',
  exam: 'Examen',
  holiday: 'Congé',
  event: 'Événement',
  deadline: 'Échéance'
};

export default function EventsPage() {
  // --- Auth Checks ---
  const { user } = useAuth(); // Retrieve current user object
  // Authorize only Department Chiefs, Teachers, or Admin users to perform creations and deletions
  const isAuthorized = user?.role === 'CHEF_DEPT' || user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // --- React State Declarations ---
  const [events, setEvents] = useState([]); // List of queried events
  const [loading, setLoading] = useState(true); // Loading overlay transition flag
  const [typeFilter, setTypeFilter] = useState(''); // Holds key of selected category filter (displays all if blank)
  const [showForm, setShowForm] = useState(false); // Controls visibility toggles for the creation form card
  
  // Creation form inputs buffer object
  const [formData, setFormData] = useState({ title: '', description: '', startDate: '', endDate: '', type: 'event', location: '', audience: ['all'] });
  
  // Track selected file uploads references for images and attached documents
  const [files, setFiles] = useState({ image: null, document: null });
  
  // Resolves backend static asset paths to a absolute URL matching either development or production address
  const getImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  // Queries events list from database whenever the category filter changes
  useEffect(() => {
    async function fetchData() {
      try { 
        setEvents(await eventService.getEvents(typeFilter)); // Request database records
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); // Disable overlay loader
      }
    }
    setLoading(true); // Enable loading state before fetching
    fetchData();
  }, [typeFilter]); // Dependency list: triggers effect call on typeFilter change

  // Prepares file forms payloads and submits creation post request to backend API
  const handleCreate = async (e) => {
    e.preventDefault(); // Stop standard browser page navigation submit event
    try {
      // Use FormData instance to allow sending file attachments (multipart/form-data)
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('type', formData.type);
      data.append('location', formData.location);
      data.append('audience', JSON.stringify(formData.audience));
      
      // Append files if they have been selected
      if (files.image) data.append('image', files.image);
      if (files.document) data.append('document', files.document);

      await eventService.createEvent(data); // Submit data payload
      setEvents(await eventService.getEvents(typeFilter)); // Refresh listing state
      setShowForm(false); // Dismiss modal creation form
      
      // Reset variables back to default initial values
      setFormData({ title: '', description: '', startDate: '', endDate: '', type: 'event', location: '', audience: ['all'] });
      setFiles({ image: null, document: null });
    } catch (err) { 
      console.error(err); 
    }
  };

  // Deletes a specific event from the DB after confirming safety
  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return; // Safety verification check
    try { 
      await eventService.deleteEvent(id); // Send DELETE query request
      setEvents(events.filter(e => e._id !== id)); // Remove deleted element from local state array list
    } catch (err) { 
      console.error(err); 
    }
  };

  // Show full page spinner if loading
  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header title elements block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Calendar size={24} className="text-accent" /> Événements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Calendrier des événements académiques</p>
        </div>
        {/* Toggle creation form button displayed only for authorized roles */}
        {isAuthorized && (
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Créer</>}
          </Button>
        )}
      </div>

      {/* Categories filters button row */}
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map(type => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              typeFilter === type ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}>{TYPE_LABELS[type]}</button>
        ))}
      </div>

      {/* Creation form Card segment */}
      {showForm && isAuthorized && (
        <Card className="animate-scale-in border-2 border-accent">
          <CardHeader className="pb-3"><CardTitle className="text-[15px]">Nouvel Événement</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title input field */}
              <Input placeholder="Titre" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="md:col-span-2" required />
              
              {/* Description textarea */}
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 shadow-sm" required />
              
              {/* Dates and classification fields row */}
              <div className="space-y-1.5"><label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Début</label><Input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className="dark:color-scheme-dark" /></div>
              <div className="space-y-1.5"><label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fin</label><Input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required className="dark:color-scheme-dark" /></div>
              
              {/* Category picker select element */}
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                <option value="academic">Académique</option><option value="exam">Examen</option><option value="event">Événement</option><option value="holiday">Congé</option><option value="deadline">Échéance</option>
              </select>
              
              {/* Location Input field */}
              <Input placeholder="Lieu" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              
              {/* Files Upload attachments section */}
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

      {/* Events loop item rows container */}
      <div className="space-y-3 stagger-children">
        {events.map((event) => (
          <Card key={event._id} className="card-interactive border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {/* Visual Date Badge sidebox */}
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
                    
                    {/* Render attachment Image preview if file reference exists */}
                    {event.image && (
                      <div className="mt-4 h-32 w-full max-w-sm rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    {/* Render download link button for attached documentations */}
                    {event.document && (
                      <a href={getImageUrl(event.document)} target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 items-center gap-1.5 text-xs text-accent hover:text-accent/80 hover:underline bg-accent/10 px-3 py-1.5 rounded-full font-medium transition-colors">
                        <Paperclip size={14} /> Pièce jointe
                      </a>
                    )}
                    
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status pills showing event classification labels */}
                  <Badge className={`text-[10px] ${TYPE_COLORS[event.type] || 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>{TYPE_LABELS[event.type] || event.type}</Badge>
                  {/* Danger trash icon button displayed if role has access */}
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
      {/* Fallback empty view layout */}
      {events.length === 0 && (
        <div className="text-center py-16"><Calendar size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-400 text-sm">Aucun événement</p></div>
      )}
    </div>
  );
}

