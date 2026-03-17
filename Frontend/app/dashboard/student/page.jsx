'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { gradeService } from '@/services/gradeService';
import { attendanceService } from '@/services/attendanceService';
import { eventService } from '@/services/eventService';
import { calculateAverage, getAttendanceRate, formatDate, getGradeColor } from '@/lib/utils';
import {
  GraduationCap, ClipboardCheck, Calendar, TrendingUp,
  BookOpen, ArrowRight, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [g, a, e] = await Promise.all([
          gradeService.getGrades().catch(() => []),
          attendanceService.getAttendance().catch(() => []),
          eventService.getEvents().catch(() => []),
        ]);
        setGrades(g);
        setAttendance(a);
        setEvents(e);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingPage message="Chargement de votre espace..." />;

  const avg = calculateAverage(grades);
  const attendanceRate = getAttendanceRate(attendance);

  const statCards = [
    { icon: TrendingUp, label: 'Moyenne Générale', value: `${avg}/20`, gradient: 'from-blue-500 to-cyan-600' },
    { icon: ClipboardCheck, label: 'Taux de Présence', value: `${attendanceRate}%`, gradient: 'from-emerald-500 to-teal-600' },
    { icon: GraduationCap, label: 'Notes Reçues', value: grades.length, gradient: 'from-violet-500 to-indigo-600' },
    { icon: Calendar, label: 'Événements', value: events.length, gradient: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white">
        <div className="absolute top-6 right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/50 text-sm font-medium mb-1">Espace Étudiant</p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Bienvenue, {user?.firstName} 👋
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat, i) => (
          <Card key={i} className="card-interactive border-0">
            <CardContent className="p-5">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md mb-4`}>
                <stat.icon className="text-white" size={18} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
              <p className="text-sm text-slate-400 font-medium mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Grades */}
        <Card className="border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px]">Dernières Notes</CardTitle>
            <Link href="/dashboard/grades" className="text-accent text-xs font-semibold hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {grades.slice(0, 5).map((grade, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <BookOpen size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{grade.courseName}</p>
                    <p className="text-[11px] text-slate-400">{grade.type} — {grade.subject}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-bold ${getGradeColor(grade.score)}`}>
                  {grade.score}/20
                </div>
              </div>
            ))}
            {grades.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Aucune note</p>}
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px]">Événements à Venir</CardTitle>
            <Link href="/dashboard/events" className="text-accent text-xs font-semibold hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {events.slice(0, 5).map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{event.title}</p>
                  <p className="text-[11px] text-slate-400">{formatDate(event.startDate)}</p>
                </div>
                <Badge variant="info" className="shrink-0 text-[10px]">{event.type}</Badge>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Aucun événement</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
