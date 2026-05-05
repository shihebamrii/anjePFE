'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { gradeService } from '@/services/gradeService';
import { attendanceService } from '@/services/attendanceService';
import { academicService } from '@/services/academicService';
import { eventService } from '@/services/eventService';
import { formatDate } from '@/lib/utils';
import {
  GraduationCap, ClipboardCheck, BookOpen, Calendar, School,
  ArrowRight, ArrowUpRight, CalendarDays, MapPin, Users
} from 'lucide-react';
import Link from 'next/link';

const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_LABELS = {
  1: '08:30 - 10:00', 2: '10:10 - 11:40', 3: '11:50 - 13:20',
  4: '14:00 - 15:30', 5: '15:40 - 17:10', 6: '17:20 - 18:50',
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [g, a, c, cl, sch, e] = await Promise.all([
          gradeService.getGrades().catch(() => []),
          attendanceService.getAttendance().catch(() => []),
          academicService.getTeacherCourses().catch(() => []),
          academicService.getTeacherClasses().catch(() => []),
          academicService.getTeacherSchedule().catch(() => []),
          eventService.getEvents().catch(() => []),
        ]);
        setGrades(g);
        setAttendance(a);
        setCourses(c);
        setClasses(cl);
        setEvents(e);

        // Filter today's sessions
        const today = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
        // Convert JS day (0=Sun) to our format (1=Mon...6=Sat)
        const dayOfWeek = today === 0 ? 7 : today; // Sunday would be 7 (not in schedule)
        const todayFiltered = (sch || [])
          .filter(s => s.dayOfWeek === dayOfWeek)
          .sort((a, b) => a.timeSlot - b.timeSlot);
        setTodaySessions(todayFiltered);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingPage message="Chargement de votre espace..." />;

  const statCards = [
    { icon: BookOpen, label: 'Mes Cours', value: courses.length, gradient: 'from-emerald-500 to-teal-600', link: '/dashboard/teacher/courses' },
    { icon: School, label: 'Mes Classes', value: classes.length, gradient: 'from-blue-500 to-cyan-600', link: '/dashboard/teacher/classes' },
    { icon: GraduationCap, label: 'Notes Créées', value: grades.length, gradient: 'from-violet-500 to-indigo-600', link: '/dashboard/grades' },
    { icon: ClipboardCheck, label: 'Présences', value: attendance.length, gradient: 'from-amber-500 to-orange-600', link: '/dashboard/attendance' },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 p-8 text-white">
        <div className="absolute top-6 right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/[0.03] translate-y-1/3 -translate-x-1/4 blur-xl" />
        <div className="relative z-10">
          <p className="text-white/50 text-sm font-medium mb-1">Espace Enseignant</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Bonjour, Prof. {user?.lastName} 👋</h1>
          <p className="text-white/40 text-sm mt-1">
            {courses.length} cours • {classes.length} classes • {todaySessions.length} séance{todaySessions.length !== 1 ? 's' : ''} aujourd'hui
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat, i) => (
          <Link href={stat.link} key={i}>
            <Card className="card-interactive cursor-pointer group border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="text-white" size={18} />
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-accent transition-colors" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
                <p className="text-sm text-slate-400 font-medium mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today's Schedule */}
        <Card className="border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <CalendarDays size={16} className="text-accent" /> Aujourd'hui
            </CardTitle>
            <Link href="/dashboard/teacher/schedule" className="text-accent text-xs font-semibold hover:underline flex items-center gap-1">
              Planning complet <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {todaySessions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucune séance programmée aujourd'hui 🎉</p>
            ) : (
              todaySessions.slice(0, 5).map((session, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-l-4 transition-colors ${
                  session.type === 'PRACTICAL' ? 'bg-amber-50/50 dark:bg-amber-950/50 border-amber-500' : session.type === 'TUTORIAL' ? 'bg-emerald-50/50 dark:bg-emerald-950/50 border-emerald-500' : 'bg-blue-50/50 dark:bg-blue-950/50 border-blue-500'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{session.courseName || 'Module'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users size={10} /> {session.className}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin size={10} /> {session.room?.name || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">{TIME_LABELS[session.timeSlot]}</span>
                    <Badge className={`block mt-1 text-[8px] uppercase tracking-wider font-black ${
                      session.type === 'PRACTICAL' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : session.type === 'TUTORIAL' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    }`}>
                      {session.type === 'PRACTICAL' ? 'TP' : session.type === 'TUTORIAL' ? 'TD' : 'CR'}
                      {session.group && ` - ${session.group}`}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px]">Notes Récentes</CardTitle>
            <Link href="/dashboard/grades" className="text-accent text-xs font-semibold hover:underline">Gérer</Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {grades.slice(0, 5).map((grade, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{grade.courseName}</p>
                  <p className="text-[11px] text-slate-400">{grade.student?.firstName} {grade.student?.lastName} — {grade.type}</p>
                </div>
                <span className="text-sm font-bold text-accent">{grade.score}/20</span>
              </div>
            ))}
            {grades.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Aucune note créée</p>}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <Card className="border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Calendar size={16} className="text-accent" /> Événements à venir
            </CardTitle>
            <Link href="/dashboard/events" className="text-accent text-xs font-semibold hover:underline">Voir tout</Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {events.slice(0, 3).map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{event.title}</p>
                  <p className="text-[11px] text-slate-400">{formatDate(event.date)} — {event.type}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">{event.audience || 'Tous'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
