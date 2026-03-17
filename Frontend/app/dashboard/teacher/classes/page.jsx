'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { academicService } from '@/services/academicService';
import { School, Search, BookOpen, CalendarDays } from 'lucide-react';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await academicService.getTeacherClasses();
        setClasses(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return classes.filter(c =>
      `${c.className} ${c.courses.join(' ')}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [classes, search]);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <School size={24} className="text-accent" /> Mes Classes
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Les classes où vous enseignez — <span className="font-semibold text-slate-700 dark:text-slate-300">{classes.length}</span> classes
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input placeholder="Rechercher une classe, un cours..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cls, i) => (
          <Card key={i} className="border-0 card-interactive group overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-600" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{cls.className}</h3>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                  <CalendarDays size={12} className="text-accent" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{cls.sessionCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium">séances</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cours enseignés</p>
                <div className="flex flex-wrap gap-1.5">
                  {cls.courses.map((course, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800">
                      <BookOpen size={10} className="mr-1" /> {course}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <School size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucune classe trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
