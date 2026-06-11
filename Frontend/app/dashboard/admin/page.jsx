'use client'; // Enable client-side rendering for component interactive actions

import { useState, useEffect } from 'react'; // React hooks for state and component mounting lifecycle
import { useAuth } from '@/context/AuthContext'; // Import auth provider context to access logged user details
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import design system UI Card primitives
import { Badge } from '@/components/ui/badge'; // UI status badges
import { Button } from '@/components/ui/button'; // UI custom buttons
import { LoadingPage } from '@/components/ui/loading'; // Dynamic fullscreen loading screen
import { newsService } from '@/services/newsService'; // Services module to interact with news endpoints
import { eventService } from '@/services/eventService'; // Services module to interact with events endpoints
import { userService } from '@/services/userService'; // Services module to interact with user details
import { stageService } from '@/services/stageService'; // Services module to interact with stage listings
import { formatDate } from '@/lib/utils'; // Time formatting utility helper
// Lucide icons representing entities and actions
import {
  Users, GraduationCap, Newspaper, Calendar, Briefcase, Building2,
  Plus, ArrowRight, ArrowUpRight, TrendingUp
} from 'lucide-react';
import Link from 'next/link'; // Navigation routing client router

// Component rendering the main admin overview page
export default function AdminDashboard() {
  const { user } = useAuth(); // Retrieve active logged administrator credentials
  // Store fetched counts/items for main portal elements
  const [stats, setStats] = useState({ users: [], news: [], events: [], stages: [] });
  const [loading, setLoading] = useState(true); // Control page loader visibility state

  // Fetch all counts in parallel during mount lifecycle
  useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, newsData, eventsData, stagesData] = await Promise.all([
          userService.getUsers().catch(() => []),
          newsService.getNews().catch(() => []),
          eventService.getEvents().catch(() => []),
          stageService.getStages('', '').catch(() => []),
        ]);
        setStats({ users: usersData, news: newsData, events: eventsData, stages: stagesData });
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); // Stop loading screen once all requests resolve
      }
    }
    fetchData();
  }, []);

  // Display fullscreen spinner while requests are pending
  if (loading) return <LoadingPage message="Chargement du tableau de bord..." />;

  // Filter and compute total numbers for specific roles
  const studentCount = stats.users.filter(u => u.role === 'STUDENT').length;
  const teacherCount = stats.users.filter(u => u.role === 'TEACHER').length;

  // Configuration map representing the data cards shown at the top of page
  const statCards = [
    { icon: Building2, label: 'Chefs de Dép.', value: stats.users.filter(u => u.role === 'CHEF_DEPT').length, gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', link: '/dashboard/admin/chefs' },
    { icon: GraduationCap, label: 'Enseignants', value: teacherCount, gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', link: '/dashboard/admin/teachers' },
    { icon: Users, label: 'Étudiants', value: studentCount, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', link: '/dashboard/admin/students' },
    { icon: Newspaper, label: 'Actualités', value: stats.news.length, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', link: '/dashboard/news' },
  ];

  return (
    // Outer stack wrapper
    <div className="space-y-8">
      {/* Welcome banner displaying logged user first name */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero-mesh p-8 text-white">
        <div className="absolute top-6 right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/50 text-sm font-medium mb-1">Bienvenue sur votre tableau de bord</p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-white/40 text-sm mt-1.5">
            Vue d&apos;ensemble du portail ISET Gafsa
          </p>
        </div>
      </div>

      {/* Stat Cards grid display */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat, i) => (
          <Link href={stat.link} key={i}>
            {/* Clickable stat card layout */}
            <Card className="card-interactive cursor-pointer group border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  {/* Colorful icon display container */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="text-white" size={18} />
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-accent transition-colors" />
                </div>
                {/* Statistic total count value */}
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
                {/* Statistic label description */}
                <p className="text-sm text-slate-400 font-medium mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <Card className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2.5">
            {/* Quick buttons links to create or manage components */}
            <Link href="/dashboard/news"><Button variant="secondary" size="sm"><Plus size={13} /> Actualité</Button></Link>
            <Link href="/dashboard/events"><Button variant="secondary" size="sm"><Calendar size={13} /> Événement</Button></Link>
            <Link href="/dashboard/admin/chefs"><Button variant="secondary" size="sm"><Building2 size={13} /> Chefs Dép.</Button></Link>
            <Link href="/dashboard/admin/teachers"><Button variant="secondary" size="sm"><GraduationCap size={13} /> Enseignants</Button></Link>
            <Link href="/dashboard/admin/students"><Button variant="secondary" size="sm"><Users size={13} /> Étudiants</Button></Link>
          </div>
        </CardContent>
      </Card>

      {/* Split layout block for recent lists */}
      <div className="grid lg:grid-cols-2 gap-5">
        
        {/* Recent News section card */}
        <Card className="border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px]">Dernières Actualités</CardTitle>
            <Link href="/dashboard/news" className="text-accent text-xs font-semibold hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Iterate news list, mapping top 4 news to UI rows */}
            {stats.news.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900 transition-colors">
                  <Newspaper size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
                {/* News tag category */}
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {item.category}
                </Badge>
              </div>
            ))}
            {/* Fallback label if news collection is empty */}
            {stats.news.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Aucune actualité</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events card */}
        <Card className="border-0">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px]">Événements à Venir</CardTitle>
            <Link href="/dashboard/events" className="text-accent text-xs font-semibold hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Mapping top 4 events */}
            {stats.events.slice(0, 4).map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                  <Calendar size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{event.title}</p>
                  <p className="text-[11px] text-slate-400">{formatDate(event.startDate)}</p>
                </div>
                {/* Event type indicator */}
                <Badge variant="info" className="shrink-0 text-[10px]">{event.type}</Badge>
              </div>
            ))}
            {/* Fallback label if events list is empty */}
            {stats.events.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Aucun événement</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
