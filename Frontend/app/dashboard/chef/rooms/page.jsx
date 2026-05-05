'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { academicService } from '@/services/academicService';
import { MapPin, Search, Users, LayoutGrid, CheckCircle2, XCircle } from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await academicService.getRooms();
        setRooms(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  // Types breakdown
  const types = useMemo(() => {
    const typeSet = new Set(rooms.map(r => r.type).filter(Boolean));
    return ['', ...Array.from(typeSet).sort()];
  }, [rooms]);

  // Filter
  const filtered = useMemo(() => {
    return rooms.filter(r => {
      const matchSearch = `${r.name} ${r.building}`.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || r.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [rooms, search, typeFilter]);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <MapPin size={24} className="text-accent" /> Salles Disponibles
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Consultez les informations sur les salles de l'ISET — <span className="font-semibold text-slate-700 dark:text-slate-300">{rooms.length}</span> salles au total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input placeholder="Rechercher par nom, bloc..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === type ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>
              {type || 'Toutes'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((room, i) => (
          <Card key={i} className={`border-0 card-interactive overflow-hidden ${!room.isAvailable ? 'opacity-60 grayscale' : ''}`}>
             <div className={`h-1.5 w-full bg-gradient-to-r ${room.type === 'LAB' ? 'from-amber-400 to-orange-500' : 'from-blue-400 to-indigo-500'}`} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={`text-[9px] uppercase tracking-wider font-extrabold ${room.type === 'LAB' ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950' : 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950'}`}>
                   {room.type}
                </Badge>
                {room.isAvailable ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <XCircle size={14} className="text-red-500" />
                )}
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">{room.name}</h3>
              
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><LayoutGrid size={12} className="text-slate-300"/> Bloc</span>
                  <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{room.building || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Users size={12} className="text-slate-300"/> Capacité</span>
                  <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{room.capacity} places</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucune salle ne correspond à votre recherche</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
