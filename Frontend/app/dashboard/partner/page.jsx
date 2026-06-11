'use client'; // Tells Next.js to run and compile this code on the client side (in the browser)

import { useState, useEffect } from 'react'; // React state hooks for lifecycle methods and reactive parameters
import { useAuth } from '@/context/AuthContext'; // Custom hook to access logged in user identity parameters
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // custom UI components for card layout containers
import { Badge } from '@/components/ui/badge'; // custom UI badge label components
import { Button } from '@/components/ui/button'; // custom UI clickable buttons
import { LoadingPage } from '@/components/ui/loading'; // custom loading page transition overlay component
import { stageService } from '@/services/stageService'; // Helper methods to contact internship/stage APIs on backend
import { formatDate, getStageTypeBadge, getStageStatusBadge } from '@/lib/utils'; // Styling helpers to format dates and output badge CSS classes
import { Briefcase, Plus, MapPin, Clock } from 'lucide-react'; // Vector icons assets
import Link from 'next/link'; // Next.js semantic routing component

export default function PartnerDashboard() {
  // --- Auth Checks ---
  const { user } = useAuth(); // Retrieve active logged in user identity context parameters

  // --- React State Declarations ---
  const [stages, setStages] = useState([]); // List of internship offers published by the partner
  const [loading, setLoading] = useState(true); // Overlay loading transition state flag

  // Fetch internship offers once upon component mount
  useEffect(() => {
    async function fetchData() {
      try { 
        setStages(await stageService.getStages('', '')); // Fetch stages list
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); // Disable screen loading spinner
      }
    }
    fetchData();
  }, []); // Empty dependency array: run once on initialization

  // Show customized loading page if fetching
  if (loading) return <LoadingPage message="Chargement de votre espace..." />;

  // Filter list categories to count metrics
  const openStages = stages.filter(s => s.status === 'OPEN');
  const closedStages = stages.filter(s => s.status !== 'OPEN');

  return (
    <div className="space-y-8">
      {/* Banner box section displaying welcome greeting and new offer trigger button */}
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

      {/* Grid displaying numeric statistics cards */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        {[
          { label: 'Offres Ouvertes', value: openStages.length, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Offres Fermées', value: closedStages.length, gradient: 'from-slate-400 to-slate-600' },
          { label: 'Total Offres', value: stages.length, gradient: 'from-blue-500 to-cyan-600' },
        ].map((s, i) => (
          <Card key={i} className="border-0">
            <CardContent className="p-5">
              {/* Colored icon wrapper box */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md mb-4`}>
                <Briefcase className="text-white" size={18} />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{s.value}</p>
              <p className="text-sm text-slate-400 font-medium mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Internship Offers list card segment */}
      <Card className="border-0">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-[15px]">Mes Offres de Stage</CardTitle>
          <Link href="/dashboard/stages" className="text-accent text-xs font-semibold hover:underline">Voir tout</Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Render first 6 internship offers cards */}
          {stages.slice(0, 6).map((stage, i) => {
            const typeBadge = getStageTypeBadge(stage.type); // Retrieve badge colors and label properties
            const statusBadge = getStageStatusBadge(stage.status); // Retrieve badge colors and status properties
            return (
              <div key={i} className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:shadow-card transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{stage.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stage.companyName}</p>
                    {/* Metadata tags line displaying location and duration parameters */}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {stage.location}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {stage.duration}</span>
                    </div>
                  </div>
                  {/* Status and classification pill tags sidebar */}
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge className={typeBadge.class + " text-[10px]"}>{typeBadge.label}</Badge>
                    <Badge className={statusBadge.class + " text-[10px]"}>{statusBadge.label}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
          {/* Empty list fallback placeholder warning */}
          {stages.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Aucune offre publiée</p>}
        </CardContent>
      </Card>
    </div>
  );
}

