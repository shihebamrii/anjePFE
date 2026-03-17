'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { authService } from '@/services/authService';
import { gradeService } from '@/services/gradeService';
import { attendanceService } from '@/services/attendanceService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, getRoleBadge, calculateAverage, getAttendanceRate, formatDate } from '@/lib/utils';
import { User, Mail, Building2, GraduationCap, ClipboardCheck, Calendar, IdCard } from 'lucide-react';

export default function ProfilePage() {
  const { user, isStudent } = useAuth();
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const p = await authService.getProfile().catch(() => null);
        setProfile(p);
        if (isStudent) {
          const [g, a] = await Promise.all([
            gradeService.getGrades().catch(() => []),
            attendanceService.getAttendance().catch(() => []),
          ]);
          setGrades(g); setAttendance(a);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [isStudent]);

  if (loading) return <LoadingPage message="Chargement du profil..." />;

  const displayUser = profile || user;
  const roleBadge = getRoleBadge(displayUser?.role);
  const avg = isStudent ? calculateAverage(grades) : null;
  const attendRate = isStudent ? getAttendanceRate(attendance) : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
        <User size={24} className="text-accent" /> Mon Profil
      </h1>

      <Card className="overflow-hidden border-0">
        <div className="h-32 gradient-hero-mesh relative">
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-lg ring-0">
              <AvatarFallback className="text-2xl">{getInitials(displayUser?.firstName, displayUser?.lastName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-14 pb-6 px-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{displayUser?.firstName} {displayUser?.lastName}</h2>
            <Badge className={roleBadge.class + " mt-1"}>{roleBadge.label}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {[
              { icon: Mail, label: 'Email', value: displayUser?.email },
              { icon: Building2, label: 'Département', value: displayUser?.department || 'N/A' },
              displayUser?.studentId && { icon: IdCard, label: 'ID Étudiant', value: displayUser.studentId },
              { icon: Calendar, label: 'Membre depuis', value: formatDate(displayUser?.createdAt) },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <item.icon size={17} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isStudent && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: GraduationCap, label: 'Moyenne Générale', value: `${avg} / 20`, gradient: 'from-blue-500 to-cyan-600' },
            { icon: ClipboardCheck, label: 'Taux de Présence', value: `${attendRate}%`, gradient: 'from-emerald-500 to-teal-600' },
          ].map((s, i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-5 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md mx-auto mb-3`}>
                  <s.icon className="text-white" size={22} />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{s.value}</p>
                <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
