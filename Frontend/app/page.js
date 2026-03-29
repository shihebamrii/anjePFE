'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, GraduationCap, Users, Briefcase, Newspaper,
  ArrowRight, BookOpen, Calendar, ChevronRight, Sparkles,
  Zap, Shield, CheckCircle2, Globe, Star, MessageSquare,
  HelpCircle, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin,
  Search, FileText, LayoutGrid, Info, ExternalLink, ArrowUpRight, Menu, ChevronDown,
  Quote, Play, Monitor, Cpu, Wrench, FlaskConical, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { newsService } from '@/services/newsService';
import { eventService } from '@/services/eventService';
import { departmentService } from '@/services/departmentService';

/* ── Animated Counter Hook ── */
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

/* ── Stat Counter Component ── */
function StatCounter({ value, label, suffix = '+' }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const { count, ref } = useCountUp(numericValue);
  return (
    <div ref={ref} className="text-center px-3 sm:px-6 py-4 sm:py-5">
      <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-1 sm:mb-2">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/50 leading-tight">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedNews, fetchedEvents, fetchedDeps] = await Promise.all([
          newsService.getNews().catch(() => []),
          eventService.getEvents().catch(() => []),
          departmentService.getAllDepartments().catch(() => [])
        ]);
        setNewsList(fetchedNews || []);
        setEventsList(fetchedEvents || []);
        setDepartmentsList(fetchedDeps || []);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Étudiants Inscrits', value: '2800' },
    { label: 'Enseignants Experts', value: '145' },
    { label: 'Diplômés Depuis 2000', value: '15000' },
    { label: 'Clubs Étudiants', value: '12' },
  ];

  const defaultDepartments = [
    { name: 'Technologies de l\'Informatique', code: 'TI', icon: Monitor },
    { name: 'Génie Électrique', code: 'GE', icon: Zap },
    { name: 'Génie Mécanique', code: 'GM', icon: Wrench },
    { name: 'Génie Civil', code: 'GC', icon: Building2 },
    { name: 'Génie des Procédés', code: 'GP', icon: FlaskConical },
    { name: 'Sciences Éco. et Gestion', code: 'SEG', icon: BarChart3 },
  ];

  const getDeptIcon = (name) => {
    if (!name) return Monitor;
    const n = name.toLowerCase();
    if (n.includes('informatique')) return Monitor;
    if (n.includes('électrique')) return Zap;
    if (n.includes('mécanique')) return Wrench;
    if (n.includes('civil')) return Building2;
    if (n.includes('procédés')) return FlaskConical;
    if (n.includes('gestion') || n.includes('économie')) return BarChart3;
    return Monitor;
  };

  const displayDepartments = departmentsList.length > 0
    ? departmentsList.map((d, i) => ({
        ...d,
        code: d.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase(),
        icon: getDeptIcon(d.name)
      }))
    : defaultDepartments;

  const quickServices = [
    { title: 'Inscription en ligne', icon: ArrowUpRight, desc: 'Portail de pré-inscription académique', href: '/services' },
    { title: 'Centre 4C', icon: Sparkles, desc: 'Carrière et Certifications professionnelles', href: '/services' },
    { title: 'Bibliothèque Digitale', icon: BookOpen, desc: 'Accès aux ressources pédagogiques', href: '/services' },
    { title: 'Espace PFE', icon: Briefcase, desc: 'Stages et coordination pratique', href: '/stages' },
    { title: 'PAQ-ISETGF', icon: Shield, desc: 'Programme d\'Appui à la Qualité', href: '/services' },
    { title: 'Concours & Mastères', icon: GraduationCap, desc: 'Formations Post-Licence', href: '/departments' },
  ];

  const menuItems = [
    { title: 'Institut', items: [
      { title: 'Présentation', desc: 'Histoire et mission', icon: Info, href: '/about' },
      { title: 'Direction', desc: 'Équipe administrative', icon: Users, href: '/about' },
      { title: 'Chiffres Clés', desc: 'Statistiques et données', icon: Star, href: '/about' },
      { title: 'Qualité', desc: 'Certifications PAQ', icon: Shield, href: '/services' },
    ]},
    { title: 'Départements', items: displayDepartments.slice(0, 6).map(dept => ({
      title: dept.name, desc: `Parcours ${dept.code}`, icon: dept.icon, href: '/departments'
    }))},
    { title: 'Formation', items: [
      { title: 'Licence Appliquée', desc: 'Bac+3 professionnel', icon: GraduationCap, href: '/departments' },
      { title: 'Mastère Professionnel', desc: 'Bac+5 spécialisé', icon: BookOpen, href: '/departments' },
      { title: 'Formation Continue', desc: 'Certifications pros', icon: Sparkles, href: '/departments' },
      { title: 'Calendrier Académique', desc: 'Dates importantes', icon: Calendar, href: '/news' },
    ]},
    { title: 'Manifestations', items: [
      { title: 'Événements', desc: 'Calendrier complet', icon: Calendar, href: '/news' },
      { title: 'Actualités', desc: 'Dernières nouvelles', icon: Newspaper, href: '/news' },
      { title: 'Clubs Étudiants', desc: 'Vie associative', icon: Users, href: '/news' },
      { title: 'Recherche', desc: 'Publications et projets', icon: FileText, href: '/news' },
    ]},
    { title: 'Entreprise', items: [
      { title: 'Stages & PFE', desc: 'Coordination des stages', icon: Briefcase, href: '/stages' },
      { title: 'Partenariats', desc: 'Nos partenaires', icon: Globe, href: '/about' },
      { title: 'Offres de Stage', desc: 'Opportunités actuelles', icon: ArrowUpRight, href: '/stages' },
      { title: 'Centre 4C', desc: 'Carrière et certifications', icon: Sparkles, href: '/services' },
    ]},
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-200/40 text-slate-900">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'top-0 bg-white/98 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] border-b border-slate-200/60'
          : 'top-0 bg-gradient-to-b from-black/30 to-transparent'
      }`}>
        {/* Top info bar — only visible when not scrolled on desktop */}
        <div className={`transition-all duration-500 overflow-hidden hidden lg:block ${
          isScrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100 bg-black/30 backdrop-blur-sm'
        }`}>
          <div className="max-w-7xl mx-auto px-8 py-2.5 flex justify-between items-center text-[11px] text-white/80 font-bold tracking-wider uppercase">
            <div className="flex gap-6">
              <span className="flex items-center gap-2"><MapPin size={12} className="text-gold" /> Campus Sidi Ahmed Zarrouk, Gafsa</span>
              <span className="flex items-center gap-2"><Mail size={12} className="text-gold" /> contact@isetgf.rnu.tn</span>
            </div>
            <div className="flex gap-5">
              <Link href="http://www.mes.tn/" target="_blank" className="hover:text-white transition-colors">Portail RNU</Link>
              <Link href="http://www.mes.tn/" target="_blank" className="hover:text-white transition-colors">Ministère MESRS</Link>
            </div>
          </div>
        </div>

        {/* Main navbar — single row: Logo | Nav Links | Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className={`rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 ${
                isScrolled ? 'w-9 h-9 shadow-md' : 'w-11 h-11 shadow-lg shadow-black/20'
              }`}>
                <Image src="/logo.jpeg" alt="ISET Gafsa" width={44} height={44} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className={`font-black tracking-tight leading-none transition-all ${
                  isScrolled ? 'text-base text-brand' : 'text-lg text-white'
                }`}>ISET GAFSA</span>
                <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${
                  isScrolled ? 'text-slate-400' : 'text-white/40'
                }`}>Établissement Public</span>
              </div>
            </Link>

            {/* Center — Desktop Nav Links (inline, single row) */}
            <div className="hidden lg:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-0">
                  {menuItems.map((menu, idx) => (
                    <NavigationMenuItem key={idx}>
                      <NavigationMenuTrigger className={`text-[11px] font-semibold uppercase tracking-[0.12em] h-10 px-4 rounded-lg transition-all bg-transparent ${
                        isScrolled
                          ? 'text-slate-600 hover:text-brand hover:bg-slate-100/60 data-[state=open]:text-brand data-[state=open]:bg-slate-100'
                          : 'text-white/70 hover:text-white hover:bg-white/10 data-[state=open]:text-white data-[state=open]:bg-white/15'
                      }`}>
                        {menu.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[520px] p-5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4 px-2">{menu.title}</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {menu.items.map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <NavigationMenuLink key={i} asChild>
                                  <a href={item.href} className="group flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-blue-50/60 transition-all duration-200">
                                    <div className="w-9 h-9 rounded-lg bg-slate-100/80 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                                      <Icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors truncate">{item.title}</p>
                                      <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                                    </div>
                                  </a>
                                </NavigationMenuLink>
                              );
                            })}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all ${
                isScrolled
                  ? 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                  : 'border-white/15 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5'
              }`}>
                <Search size={13} />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Rechercher</span>
              </button>

              <Link href="/login" className="hidden sm:block">
                <Button className={`rounded-lg px-5 h-9 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isScrolled
                    ? 'bg-brand hover:bg-brand-light text-white shadow-sm hover:shadow-md'
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/15'
                }`}>
                  Accès Extranet
                </Button>
              </Link>

              {/* Mobile Menu Trigger */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={`h-10 w-10 rounded-xl ${
                      isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                    }`}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] max-w-[380px] p-0 flex flex-col bg-white">
                    <SheetHeader className="px-5 py-5 border-b border-slate-100">
                      <SheetTitle className="font-black text-lg text-brand uppercase tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                          <Image src="/logo.jpeg" alt="Logo ISET" width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className={`font-black text-lg sm:text-xl tracking-tight leading-none ${isScrolled ? 'text-brand' : 'text-brand'}`}>
                            ISET GAFSA
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] mt-1 ${isScrolled ? 'text-brand/60' : 'text-brand/60'}`}>
                            Établissement Public
                          </span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      <Accordion type="single" collapsible className="space-y-0.5">
                        {menuItems.map((menu, idx) => (
                          <AccordionItem key={idx} value={`item-${idx}`} className="border-none">
                            <AccordionTrigger className="text-[13px] font-bold uppercase tracking-wider text-slate-600 hover:text-brand py-3 px-2 rounded-lg hover:bg-slate-50 hover:no-underline [&[data-state=open]]:text-brand [&[data-state=open]]:bg-blue-50">
                              {menu.title}
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-3 px-1">
                              <div className="space-y-0.5 pl-2 border-l-2 border-blue-200 ml-2">
                                {menu.items.map((item, i) => {
                                  const Icon = item.icon;
                                  return (
                                    <a key={i} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50/60 transition-colors group">
                                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                                        <Icon size={14} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-700 group-hover:text-brand transition-colors truncate">{item.title}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>

                      {/* Quick links for mobile */}
                      <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-3 px-2">Contact</p>
                        <div className="space-y-2 px-2 text-[12px] text-slate-500">
                          <p className="flex items-center gap-2"><MapPin size={13} className="text-gold" /> Campus Sidi Ahmed Zarrouk, Gafsa</p>
                          <p className="flex items-center gap-2"><Phone size={13} className="text-gold" /> +216 76 211 500</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 space-y-2">
                      <Link href="/login" className="block">
                        <Button className="w-full bg-brand hover:bg-brand-light text-white rounded-xl h-11 text-[11px] font-bold uppercase tracking-widest group">
                          Accès Extranet <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════ CINEMATIC HERO ═══════════ */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        {/* Background Image with Ken Burns */}
        <div className="absolute inset-0">
          <Image
            src="/hero_image.png"
            alt="Campus ISET Gafsa"
            fill
            priority
            sizes="100vw"
            className="object-cover ken-burns"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 hero-overlay-bottom" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-40 pb-24 sm:pb-28 lg:pb-32">
          <div className="max-w-3xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-8 sm:w-10 h-[2px] bg-gold" />
              <span className="text-gold text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em]">Excellence &amp; Innovation</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.05] mb-5 sm:mb-6 tracking-tight">
              Institut Supérieur<br />
              <em className="text-gold" style={{ fontStyle: 'italic' }}>des Études</em><br />
              Technologiques
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium">
              Formation scientifique et technologique d&apos;excellence, au service de l&apos;insertion professionnelle et de l&apos;innovation industrielle.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-light text-brand px-6 sm:px-8 h-11 sm:h-13 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-full group shadow-lg shadow-gold/20">
                <Link href="/register">
                  Inscription Académique <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/40 text-white px-6 sm:px-8 h-11 sm:h-13 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-full">
                <Link href="/about">
                  Découvrir l&apos;ISET
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator — hidden on small screens */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden xl:flex flex-col items-center gap-2 animate-pulse-soft">
          <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em]">Défiler</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ═══════════ ANIMATED STATS STRIP ═══════════ */}
      <section className="bg-brand relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.3\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((s, i) => (
              <StatCounter key={i} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT / MISSION ═══════════ */}
      <section className="pt-20 sm:pt-32 pb-16 sm:pb-24 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header — Centered, editorial style */}
          <div className="text-center mb-16 sm:mb-24 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent to-gold" />
              <span className="text-gold text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em]">Notre Mission</span>
              <div className="w-8 h-[1.5px] bg-gradient-to-l from-transparent to-gold" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[3.25rem] text-brand mb-6 sm:mb-8 leading-[1.1]">
              Forger les Experts de <em className="text-gold" style={{ fontStyle: 'italic' }}>Demain</em>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Depuis sa création, l&apos;ISET Gafsa s&apos;est imposé comme un pilier du réseau ISET en Tunisie. Notre approche pédagogique combine rigueur académique et immersion pratique.
            </p>
          </div>

          {/* Value Pillars — Premium numbered cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
            {[
              { num: '01', icon: Shield, title: 'Excellence', desc: 'Programmes certifiés PAQ, garantissant les standards éducatifs les plus élevés du réseau universitaire.' },
              { num: '02', icon: Cpu, title: 'Innovation', desc: 'Infrastructure technologique de pointe et cursus adapté aux exigences du marché numérique.' },
              { num: '03', icon: Globe, title: 'Ouverture', desc: 'Réseau de partenariats industriels nationaux et internationaux pour une formation ancrée dans le réel.' },
              { num: '04', icon: CheckCircle2, title: 'Impact', desc: 'Taux d\'insertion professionnelle parmi les plus élevés, avec plus de 15 000 diplômés depuis 2000.' },
            ].map((v, i) => (
              <div key={i} className="group relative bg-white hover:bg-slate-50/80 transition-all duration-500 cursor-pointer border-b sm:border-b-0 sm:border-r border-slate-200/80 last:border-r-0 last:border-b-0">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-brand to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-6 sm:mb-8">
                    <span className="text-[2.5rem] sm:text-[3rem] font-serif font-bold text-slate-200/70 leading-none select-none">{v.num}</span>
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-sm">
                      <v.icon size={18} />
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="font-bold text-brand text-base sm:text-lg mb-3">{v.title}</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{v.desc}</p>
                  
                  {/* Hover-reveal arrow */}
                  <div className="mt-5 flex items-center gap-2 text-brand opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-[10px] font-bold uppercase tracking-widest">En savoir plus</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom row — Mission bullets + CTA in a dark strip */}
          <div className="mt-10 sm:mt-16 bg-brand rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16 shadow-2xl shadow-brand/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px]" />
            
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1.5px] bg-gold" />
                <span className="text-gold/80 text-[10px] font-bold uppercase tracking-[0.3em]">Nos Engagements</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { num: '01', text: 'Formation de cadres techniciens supérieurs hautement qualifiés.' },
                  { num: '02', text: 'Promotion de la recherche technologique et de l\'innovation.' },
                  { num: '03', text: 'Coopération étroite avec les partenaires industriels régionaux.' },
                ].map((item, i) => (
                  <div key={i} className="group/item">
                    <span className="text-gold/30 font-serif text-lg font-bold mb-2 block">{item.num}</span>
                    <p className="text-white/60 text-[13px] leading-relaxed font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 relative z-10 w-full lg:w-auto">
              <Button asChild className="w-full lg:w-auto bg-gold hover:bg-gold-light text-brand border-0 rounded-xl h-13 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20 group">
                <Link href="/about">
                  Histoire & Chiffres Clés <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DIRECTOR QUOTE ═══════════ */}
      <section className="relative overflow-hidden w-full">
        <div className="flex flex-col lg:flex-row w-full">
          {/* Left — Dark branded panel */}
          <div className="bg-brand w-full lg:w-[45%] p-8 sm:p-14 lg:p-20 flex items-center relative shrink-0">
            <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'0.3\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
            <div className="relative z-10 w-full max-w-xl mx-auto lg:mr-0 lg:ml-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center">
                  <Quote size={24} className="text-gold" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Mot du Directeur</p>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">Direction ISET Gafsa</p>
                </div>
              </div>
              <blockquote className="font-serif text-xl sm:text-2xl lg:text-[1.75rem] text-white/90 leading-relaxed italic mb-8">
                &ldquo;Former des compétences capables de relever les défis technologiques de demain, tout en restant ancrés dans les réalités socio-économiques de notre région.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-10 bg-gold/40" />
                <span className="text-gold/50 text-[10px] font-bold uppercase tracking-[0.3em]">Excellence depuis 2000</span>
              </div>
            </div>
          </div>

          {/* Right — Light stats panel */}
          <div className="bg-slate-50 w-full lg:w-[55%] p-8 sm:p-14 lg:p-20 flex items-center shrink-0">
            <div className="w-full max-w-2xl mx-auto lg:ml-0 lg:mr-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 mb-8 sm:mb-12">Chiffres Clés de l&apos;Institut</p>
              <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-12">
                {[
                  { value: '24+', label: 'Années d\'Expérience', sublabel: 'Depuis 2000' },
                  { value: '6', label: 'Départements', sublabel: 'Filières spécialisées' },
                  { value: '98%', label: 'Taux de Réussite', sublabel: 'Année 2024-2025' },
                  { value: '45+', label: 'Partenariats', sublabel: 'Entreprises & Institutions' },
                ].map((stat, i) => (
                  <div key={i} className="group cursor-default">
                    <p className="font-serif text-3xl sm:text-4xl font-bold text-brand mb-1.5 group-hover:text-blue-700 transition-colors">{stat.value}</p>
                    <p className="text-sm font-semibold text-slate-700 mb-0.5">{stat.label}</p>
                    <p className="text-[11px] text-slate-400">{stat.sublabel}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES BENTO GRID ═══════════ */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        {/* Subtle background dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 sm:mb-24 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent to-brand" />
              <span className="text-brand text-[10px] font-bold uppercase tracking-[0.3em]">Accès Rapide</span>
              <div className="w-8 h-[1.5px] bg-gradient-to-l from-transparent to-brand" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand leading-tight">
              Services & Plateformes
            </h2>
          </div>

          {/* Premium Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-auto">
            {quickServices.map((service, i) => {
              const isHeroCard = i === 0;
              const cardSpanClass = isHeroCard ? 'md:col-span-2 lg:col-span-2 lg:row-span-2' : '';
              
              return (
                <Link key={i} href={service.href} className={`group relative bg-white border border-slate-200/60 rounded-3xl hover:border-blue-300 transition-all duration-500 overflow-hidden cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] hover:-translate-y-1 ${cardSpanClass} flex flex-col`}>
                  
                  {/* Subtle inner background gradients */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    isHeroCard ? 'from-blue-50/40 via-white to-blue-50/60' : 'from-white to-slate-50/50'
                  }`} />
                  
                  {/* Large decorative element for the hero card */}
                  {isHeroCard && (
                    <div className="absolute right-8 top-8 opacity-[0.04] pointer-events-none">
                      <service.icon size={200} strokeWidth={0.8} />
                    </div>
                  )}

                  <div className={`relative z-10 flex flex-col justify-between h-full ${isHeroCard ? 'p-10 sm:p-12' : 'p-7 sm:p-8'}`}>
                    {/* Icon */}
                    <div className={`${
                      isHeroCard ? 'w-16 h-16 rounded-2xl mb-6' : 'w-12 h-12 rounded-xl mb-5'
                    } bg-brand/5 border border-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-500 shrink-0`}>
                      <service.icon size={isHeroCard ? 28 : 20} strokeWidth={isHeroCard ? 1.5 : 2} />
                    </div>
                    
                    <div>
                      <h4 className={`${isHeroCard ? 'text-xl sm:text-2xl font-serif' : 'text-base'} font-bold text-brand mb-2 tracking-tight group-hover:text-blue-900 transition-colors`}>
                        {service.title}
                      </h4>
                      <p className={`${isHeroCard ? 'text-sm max-w-md' : 'text-[13px]'} text-slate-500 font-medium leading-relaxed`}>
                        {service.desc}
                      </p>
                    </div>

                    {/* Arrow hint */}
                    {isHeroCard && (
                      <div className="mt-6 flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500">
                        Accéder au portail <ArrowRight size={14} />
                      </div>
                    )}
                    
                    {!isHeroCard && (
                      <div className="absolute top-7 right-7 w-7 h-7 rounded-full flex items-center justify-center text-brand/40 group-hover:text-brand group-hover:bg-brand/5 transition-all duration-300">
                        <ArrowUpRight size={14} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ NEWS & EVENTS ═══════════ */}
      <section className="py-16 sm:py-24 bg-slate-50 relative border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-12 lg:gap-20">
            {/* News Feed - Elegant typography focus */}
            <div>
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand">Actualités</h2>
                <Button asChild variant="outline" className="hidden sm:flex rounded-full border-slate-200 hover:bg-white px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <Link href="/news">Voir tout</Link>
                </Button>
              </div>

              <div className="flex flex-col gap-10">
                {newsList.length > 0 ? (
                  newsList.slice(0, 3).map((news, i) => (
                    <Link href="/news" key={news._id} className="group cursor-pointer block">
                      {/* Meta info */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{news.category || 'NOUVELLE'}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[11px] font-medium text-slate-400">
                          {new Date(news.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      {/* Title & Excerpt */}
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug mb-3">
                        {news.title}
                      </h3>
                      <p className="text-slate-500 text-sm sm:text-base leading-relaxed line-clamp-2">
                        {news.excerpt || (news.content ? news.content.substring(0, 150) + '...' : '')}
                      </p>
                      {/* Fine separator line */}
                      {i < 2 && <div className="w-full h-px bg-gradient-to-r from-slate-200 to-transparent mt-10" />}
                    </Link>
                  ))
                ) : (
                  <div className="text-slate-500 text-sm font-medium py-12 bg-white border border-slate-200/60 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <Newspaper size={20} />
                    </div>
                    <span>La section actualités est en cours d&apos;enrichissement. Revenez bientôt&nbsp;!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Events Sidebar - Dark frosted glass aesthetic */}
            <div className="lg:sticky lg:top-36 h-fit">
              <div className="bg-brand rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(11,21,54,0.3)]">
                {/* Premium glowing background effects */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-gold/5 rounded-full blur-[60px]" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                      <Calendar size={20} className="text-gold" />
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-white">Manifestations</h2>
                  </div>

                  <div className="space-y-6">
                    {eventsList.length > 0 ? (
                      eventsList.slice(0, 3).map((event) => {
                        const d = new Date(event.startDate);
                        return (
                          <Link href="/news" key={event._id} className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5 sm:p-6 transition-all duration-300 block">
                            <div className="flex gap-5 sm:gap-6 items-center">
                              {/* Date Box */}
                              <div className="flex flex-col items-center justify-center w-14 h-16 rounded-xl bg-white/5 shadow-inner shrink-0">
                                <span className="text-2xl font-serif font-bold text-white leading-none mb-1">{d.toLocaleDateString('fr-FR', { day: '2-digit' })}</span>
                                <span className="text-[9px] font-bold text-gold uppercase tracking-[0.2em]">{d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}</span>
                              </div>
                              {/* Content */}
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1.5 block">{event.type || 'Événement'}</span>
                                <h4 className="font-semibold text-[15px] sm:text-base text-white/90 group-hover:text-white transition-colors leading-snug">{event.title}</h4>
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="text-white/60 text-[13px] font-medium py-8 text-center flex flex-col items-center gap-3 bg-white/5 border border-white/5 rounded-2xl">
                        <Calendar size={20} className="text-white/20" />
                        Aucun événement planifié pour le moment.
                      </div>
                    )}
                  </div>

                  <Button asChild className="w-full mt-12 bg-white text-brand hover:bg-slate-100 border-0 rounded-xl h-14 text-xs font-black uppercase tracking-widest transition-all shadow-lg">
                    <Link href="/news">Calendrier Complet</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DEPARTMENTS ═══════════ */}
      <section className="py-20 sm:py-28 bg-brand text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gold/3 -skew-x-12" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-6 sm:gap-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-[2px] bg-gold" />
                <span className="text-gold text-[11px] font-bold uppercase tracking-[0.3em]">Nos Filières</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">Départements d&apos;Enseignement</h2>
              <p className="text-white/40 text-base sm:text-lg">Nos unités académiques assurent des formations spécialisées encadrées par des experts.</p>
            </div>
            <Button asChild className="bg-gold hover:bg-gold-light text-brand rounded-full px-10 h-14 text-xs font-black uppercase tracking-widest border-0 shadow-lg shadow-gold/20">
              <Link href="/departments">Tous les Parcours</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
            {displayDepartments.map((dept, i) => {
              const Icon = dept.icon || LayoutGrid;
              return (
                <Link key={dept._id || i} href="/departments" className="group relative bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 hover:border-white/15 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full min-h-[320px]">
                  
                  {/* Subtle hover gradient background */}
                  <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gold/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Faint internal dot grid to add texture */}
                  <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  
                  <div className="p-8 sm:p-10 relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-auto">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 group-hover:text-gold group-hover:bg-white/10 group-hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] group-hover:scale-105 transition-all duration-500">
                        <Icon size={28} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-white/20 group-hover:text-gold/80 transition-colors uppercase py-1.5 px-3 rounded-full border border-white/5 bg-black/10">
                        {dept.code}
                      </span>
                    </div>

                    <div className="pt-10">
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white/90 group-hover:text-white leading-tight tracking-tight transition-colors">
                        {dept.name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/30 group-hover:text-gold transition-colors duration-500">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">Explorer le département</span>
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ ENTERPRISE CTA ═══════════ */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-8 sm:p-16 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[80px]" />
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center text-blue-600 mb-8 sm:mb-10">
                <Briefcase size={28} />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand mb-6 leading-tight">
                Espace Entreprise & <em className="text-gold" style={{ fontStyle: 'italic' }}>Stages</em>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-12 sm:mb-16">
                Nous accompagnons nos étudiants et nos partenaires industriels dans la quête d&apos;excellence pratique en favorisant une immersion totale dans le tissu socio-économique tunisien.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 h-14 text-xs font-bold uppercase tracking-widest border-0 
                  shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(37,99,235,0.25)] rounded-full transition-all hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_12px_25px_rgba(37,99,235,0.35)] hover:-translate-y-0.5">
                  <Link href="/stages">
                    Déposer une Offre <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-white border-slate-200 hover:bg-slate-50 text-slate-700 px-10 h-14 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
                  <Link href="/stages">Coordination des Stages</Link>
                </Button>
              </div>
            </div>

            <div className="w-full mt-16 sm:mt-20 pt-12 border-t border-slate-200/50 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-8">Ils nous font confiance</p>
              <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                {/* Simulated partner logos visually using premium typography */}
                {['Microsoft', 'Cisco', 'Orange', 'Huawei', 'CPG'].map(p => (
                  <span key={p} className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand mb-5">Questions Fréquentes</h2>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-xl mx-auto">Tout ce que vous devez savoir pour réussir votre parcours académique et administratif à l&apos;ISET.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: "Comment s'inscrire au mastère professionnel ?", a: "Les candidatures se font exclusivement via le portail national de l'Université durant les périodes annuelles de Mars et Juin. Un dossier dématérialisé doit être soumis pour pré-sélection." },
              { q: "Quel est le rôle du centre 4C ?", a: "Le Centre de Carrière et de Certification des Compétences (4C) accompagne les étudiants dans leur développement personnel, propose des certifications reconnues (Microsoft, Cisco...) et favorise l'insertion professionnelle par des ateliers pratiques." },
              { q: "Comment obtenir une attestation de présence ?", a: "Les attestations sont délivrées par le service de scolarité sur simple présentation de la carte d'étudiant en cours de validité. Le délai de traitement est généralement de 24h ouvrables." },
              { q: "Où peut-on consulter les résultats des examens ?", a: "Les résultats officiels sont affichés dans les vitrines de l'institut et sont également disponibles en temps réel via l'accès extranet privé sécurisé pour chaque étudiant." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-slate-200/80 rounded-2xl px-6 sm:px-8 overflow-hidden shadow-sm data-[state=open]:shadow-md data-[state=open]:border-blue-200 transition-all duration-300">
                <AccordionTrigger className="text-left text-[15px] sm:text-base font-bold text-slate-800 hover:text-blue-600 hover:no-underline group py-6">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <span className="text-[11px] font-black text-blue-500/50 bg-blue-50 px-3 py-1.5 rounded-full shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">Q{i + 1}</span>
                    <span className="leading-snug">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed pb-6 pl-4 sm:pl-[4.5rem] pr-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 p-8 bg-brand rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_15px_40px_-10px_rgba(11,21,54,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-gold/5 rounded-full blur-[40px]" />
            
            <div className="flex gap-5 items-center relative z-10 w-full md:w-auto text-center md:text-left flex-col md:flex-row">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold backdrop-blur-md"><MessageSquare size={24} /></div>
              <div>
                <h5 className="font-bold text-lg mb-1">Besoin d&apos;assistance ?</h5>
                <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.2em]">Service scolarité ouvert 8h - 14h</p>
              </div>
            </div>
            <Button asChild className="w-full md:w-auto bg-white hover:bg-slate-100 text-brand rounded-full h-14 px-8 text-xs font-black uppercase tracking-widest border-0 shadow-lg relative z-10 transition-transform hover:-translate-y-0.5 hover:shadow-xl">
              <Link href="/contact">Contacter le Support</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-brand text-white pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-16 mb-14 sm:mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <Image src="/logo.jpeg" alt="ISET" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <span className="font-black text-2xl tracking-tight">ISET GAFSA</span>
              </div>
              <p className="text-white/35 max-w-sm mb-8 leading-relaxed font-medium text-sm">
                Établissement public sous la tutelle du Ministère de l&apos;Enseignement Supérieur et de la Recherche Scientifique.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <Link key={i} href="https://www.facebook.com/IsetGafsa" target="_blank" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-gold hover:text-brand transition-all">
                    <Icon size={16} />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-gold mb-8">Administration</h4>
              <ul className="grid gap-3 text-white/40 text-sm">
                {['Direction des études', 'Secrétariat Général', 'Directeur de l\'Institut', 'Service Scolarité', 'Coordination des stages'].map(link => (
                  <li key={link}><Link href={link.includes('stages') ? '/stages' : '/about'} className="hover:text-white transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-gold mb-8">Contact</h4>
              <ul className="grid gap-6 text-white/40 text-sm">
                <li className="flex gap-3"><MapPin size={20} className="text-gold shrink-0" /><span>Campus Sidi Ahmed Zarrouk, Gafsa 2112</span></li>
                <li className="flex gap-3"><Phone size={16} className="text-gold shrink-0" /><span>+216 76 211 500</span></li>
                <li className="flex gap-3"><Mail size={16} className="text-gold shrink-0" /><span>contact@isetgf.rnu.tn</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              © {new Date().getFullYear()} ISET Gafsa — Direction des Études et des Stages
            </p>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <Link href="http://www.mes.tn/" target="_blank" className="hover:text-white transition-colors">Portail RNU</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Mentions Légales</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
