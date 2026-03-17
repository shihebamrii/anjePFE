'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { stageService } from '@/services/stageService';
import { formatDate, getStageTypeBadge, getStageStatusBadge } from '@/lib/utils';
import { Briefcase, Plus, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try { setStages(await stageService.getStages('', '')); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingPage message="Chargement de votre espace..." />;

  const openStages = stages.filter(s => s.status === 'OPEN');
  const closedStages = stages.filter(s => s.status !== 'OPEN');

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white flex items-center justify-between">
        <div className="relative z-10">
          <p className="text-white/50 text-sm font-medium mb-1">Espace Partenaire</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Bienvenue, {user?.firstName} 👋</h1>
        </div>
        <Link href="/dashboard/stages">
          <Button className="bg-white text-amber-700 hover:bg-white/90 border-0 shadow-elevated">
            <Plus size={15} /> Nouvelle Offre
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 stagger-children">
        {[
          { label: 'Offres Ouvertes', value: openStages.length, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Offres Fermées', value: closedStages.length, gradient: 'from-slate-400 to-slate-600' },
          { label: 'Total Offres', value: stages.length, gradient: 'from-blue-500 to-cyan-600' },
        ].map((s, i) => (
          <Card key={i} className="border-0">
            <CardContent className="p-5">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md mb-4`}>
                <Briefcase className="text-white" size={18} />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{s.value}</p>
              <p className="text-sm text-slate-400 font-medium mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-[15px]">Mes Offres de Stage</CardTitle>
          <Link href="/dashboard/stages" className="text-accent text-xs font-semibold hover:underline">Voir tout</Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {stages.slice(0, 6).map((stage, i) => {
            const typeBadge = getStageTypeBadge(stage.type);
            const statusBadge = getStageStatusBadge(stage.status);
            return (
              <div key={i} className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:shadow-card transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{stage.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stage.companyName}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {stage.location}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {stage.duration}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge className={typeBadge.class + " text-[10px]"}>{typeBadge.label}</Badge>
                    <Badge className={statusBadge.class + " text-[10px]"}>{statusBadge.label}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
          {stages.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Aucune offre publiée</p>}
        </CardContent>
      </Card>
    </div>
  );
}
