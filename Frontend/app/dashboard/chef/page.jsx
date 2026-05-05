'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { departmentService } from '@/services/departmentService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Building2, Users, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const GRADE_COLORS = {
  'Maît.Tech': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
  'Tech': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  'Ens.Sec': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  'Vac': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  'Ing': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  'Prof.Em': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800',
};

export default function ChefDashboard() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await departmentService.getMyDepartment();
        setDepartments(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingPage message="Chargement du département..." />;

  const dept = departments[0];
  if (!dept) return <div className="p-8 text-center text-slate-400">Aucun département trouvé pour votre compte.</div>;

  const teachers = dept.teachers || [];

  // Grade breakdown
  const gradeBreakdown = {};
  teachers.forEach(t => {
    const key = t.gradeAbbr || 'Autre';
    gradeBreakdown[key] = (gradeBreakdown[key] || 0) + 1;
  });

  // Recent teachers (last 5)
  const recentTeachers = teachers.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/[0.04] -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/[0.03] translate-y-1/3 -translate-x-1/4 blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={20} className="text-white/70" />
            <span className="text-sm font-medium text-white/60">Chef de Département</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-white/50 mt-1 text-sm max-w-xl">
            Département : <span className="text-white/90 font-semibold">{dept.name}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border-0 card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
                <Users className="text-white" size={18} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{teachers.length}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total Enseignants</p>
          </CardContent>
        </Card>

        <Card className="border-0 card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                <Users className="text-white" size={18} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{(dept.classes || []).length}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total Classes</p>
          </CardContent>
        </Card>

        {Object.entries(gradeBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([grade, count]) => (
          <Card key={grade} className="border-0 card-interactive">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                  <GraduationCap className="text-white" size={18} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{count}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{grade}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grade distribution */}
      <Card className="border-0">
        <CardContent className="p-5">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Répartition par Grade</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(gradeBreakdown).sort((a, b) => b[1] - a[1]).map(([grade, count]) => (
              <div key={grade} className={`px-3.5 py-2 rounded-xl text-sm font-semibold border ${GRADE_COLORS[grade] || GRADE_COLORS['Vac']}`}>
                {grade}: <span className="font-extrabold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Teachers */}
      <Card className="border-0">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <BookOpen size={16} className="text-accent" /> Enseignants
            </h3>
            <Link href="/dashboard/chef/teachers" className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTeachers.map((teacher, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-[10px]">{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{teacher.firstName} {teacher.lastName}</p>
                    <p className="text-[11px] text-slate-400">{teacher.email}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] ${GRADE_COLORS[teacher.gradeAbbr] || GRADE_COLORS['Vac']}`}>
                  {teacher.gradeAbbr || teacher.grade}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
