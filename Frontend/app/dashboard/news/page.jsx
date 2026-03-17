'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { newsService } from '@/services/newsService';
import { formatDate } from '@/lib/utils';
import { Newspaper, Plus, Trash2, X, Eye, Heart, Image as ImageIcon, FileText, Paperclip } from 'lucide-react';

const CATEGORIES = ['all', 'academic', 'clubs', 'admin', 'events', 'research', 'announcements'];
const CATEGORY_LABELS = { all: 'Tout', academic: 'Académique', clubs: 'Clubs', admin: 'Admin', events: 'Événements', research: 'Recherche', announcements: 'Annonces' };

export default function NewsPage() {
  const { user } = useAuth();
  const isChef = user?.role === 'CHEF_DEPT';
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', excerpt: '', category: 'announcements', type: 'article', priority: 'normal', tags: ''
  });
  const [files, setFiles] = useState({ image: null, document: null });
  
  const getImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    async function fetchData() {
      try { setNews(await newsService.getNews(category)); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    setLoading(true);
    fetchData();
  }, [category]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('excerpt', formData.excerpt);
      data.append('category', formData.category);
      data.append('type', formData.type);
      data.append('priority', formData.priority);
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      data.append('tags', JSON.stringify(tagsArray));
      
      if (files.image) data.append('image', files.image);
      if (files.document) data.append('document', files.document);

      await newsService.createNews(data);
      setNews(await newsService.getNews(category));
      setShowForm(false);
      setFormData({ title: '', content: '', excerpt: '', category: 'announcements', type: 'article', priority: 'normal', tags: '' });
      setFiles({ image: null, document: null });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette actualité ?')) return;
    try { await newsService.deleteNews(id); setNews(news.filter(n => n._id !== id)); }
    catch (err) { console.error(err); }
  };

  if (loading) return <LoadingPage />;

  const priorityBorders = { high: 'border-l-red-500', normal: 'border-l-blue-500', low: 'border-l-slate-300' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Newspaper size={24} className="text-accent" /> Actualités
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Dernières nouvelles et annonces du campus</p>
        </div>
        {isChef && (
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Publier</>}
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === cat
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}>{CATEGORY_LABELS[cat]}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && isChef && (
        <Card className="animate-scale-in border-2 border-accent">
          <CardHeader className="pb-3"><CardTitle className="text-[15px]">Nouvelle Actualité</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input placeholder="Titre" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <Input placeholder="Résumé" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} required />
              <textarea placeholder="Contenu complet" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent shadow-sm" required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                  <option value="announcements">Annonces</option>
                  <option value="academic">Académique</option>
                  <option value="events">Événements</option>
                  <option value="clubs">Clubs</option>
                  <option value="research">Recherche</option>
                </select>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                  <option value="normal">Normal</option>
                  <option value="high">Haute</option>
                  <option value="low">Basse</option>
                </select>
                <Input placeholder="Tags (séparés par virgule)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
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
              <Button type="submit" variant="accent">Publier</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* News Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
        {news.map((item) => (
          <Card key={item._id} className={`card-interactive border-l-4 border-0 ${priorityBorders[item.priority] || priorityBorders.normal}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={item.type === 'urgent' ? 'danger' : 'secondary'} className="text-[10px]">{item.type}</Badge>
                {isChef && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => handleDelete(item._id)}>
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
              
              {item.image && (
                <div className="h-40 w-full mb-4 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                  <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 tracking-tight">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{item.excerpt}</p>
              
              {item.document && (
                <a href={getImageUrl(item.document)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 hover:underline mb-4 bg-accent/10 px-3 py-1.5 rounded-full font-medium transition-colors">
                  <Paperclip size={14} /> Pièce jointe
                </a>
              )}
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formatDate(item.createdAt)}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Eye size={12} /> {item.views}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {item.likes}</span>
                </div>
              </div>
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">#{tag}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {news.length === 0 && (
        <div className="text-center py-16">
          <Newspaper size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 text-sm">Aucune actualité dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}
