'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { academicService } from '@/services/academicService';
import { BookOpen, Search, MapPin, CalendarDays, Users } from 'lucide-react';

const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_LABELS = ['', '08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];

const TYPE_COLORS = {
  LECTURE: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  TUTORIAL: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  PRACTICAL: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};
const TYPE_LABELS = { LECTURE: 'Cours', TUTORIAL: 'TD', PRACTICAL: 'TP' };

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await academicService.getTeacherCourses();
        setCourses(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const types = useMemo(() => {
    const typeSet = new Set(courses.map(c => c.type));
    return ['', ...Array.from(typeSet).sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = `${c.courseName} ${c.className}`.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [courses, search, typeFilter]);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <BookOpen size={24} className="text-accent" /> Mes Cours
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Vos matières assignées — <span className="font-semibold text-slate-700 dark:text-slate-300">{courses.length}</span> cours au total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input placeholder="Rechercher par cours, classe..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {types.map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === type ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>
              {type ? (TYPE_LABELS[type] || type) : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <Card key={i} className="border-0 card-interactive group overflow-hidden">
            <div className={`h-1.5 w-full bg-gradient-to-r ${course.type === 'PRACTICAL' ? 'from-rose-400 to-pink-500' : course.type === 'TUTORIAL' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-indigo-500'}`} />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">{course.courseName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-[10px] uppercase font-bold ${TYPE_COLORS[course.type] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {TYPE_LABELS[course.type] || course.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                  <Users size={14} className="text-slate-400 shrink-0" />
                  <span>{course.className}</span>
                </div>

                {/* Schedule slots */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {course.slots?.map((slot, j) => (
                    <div key={j} className="bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <span className="text-accent">{DAYS[slot.dayOfWeek]}</span> {TIME_LABELS[slot.timeSlot]}
                      {slot.room && <span className="ml-1 text-slate-400">• {slot.room}</span>}
                      {slot.group && <span className="ml-1 text-violet-500">({slot.group})</span>}
                    </div>
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
            <BookOpen size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucun cours trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
