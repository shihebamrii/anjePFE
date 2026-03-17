'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, GraduationCap, Users, Briefcase, Newspaper, 
  ArrowRight, BookOpen, Calendar, ChevronRight, Sparkles, 
  Zap, Shield, CheckCircle2, Globe, Star, MessageSquare,
  HelpCircle, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin,
  Search, FileText, LayoutGrid, Info, ExternalLink, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { label: 'Étudiants', value: '2,800+', desc: 'Inscrits pour 2023/2024' },
    { label: 'Enseignants', value: '145+', desc: 'Experts Permanents' },
    { label: 'Diplômés', value: '15,000+', desc: 'Depuis la création' },
    { label: 'Clubs', value: '12+', desc: 'Vie Estudiantine active' },
  ];

  const departments = [
    { name: 'Informatique', code: 'TI', icon: LayoutGrid },
    { name: 'Génie Électrique', code: 'GE', icon: Zap },
    { name: 'Génie Mécanique', code: 'GM', icon: Shield },
    { name: 'Génie Civil', code: 'GC', icon: Building2 },
    { name: 'Génie des Procédés', code: 'GP', icon: Globe },
    { name: 'Gestion des Entreprises', code: 'SEG', icon: Users },
  ];

  const quickServices = [
    { title: 'Inscription en ligne', icon: ArrowUpRight, desc: 'Portail de pré-inscription' },
    { title: 'Centre 4C', icon: Sparkles, desc: 'Carrière et Certifications' },
    { title: 'Bibliothèque Digitale', icon: BookOpen, desc: 'Ressources pédagogiques' },
    { title: 'Espace PFE', icon: Briefcase, desc: 'Stages et coordination' },
    { title: 'PAQ-ISETGF', icon: Shield, desc: 'Qualité et Appui' },
    { title: 'Concours & Mastères', icon: GraduationCap, desc: 'Post-Licence' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-accent/30 text-slate-900 dark:text-slate-100">
      
      {/* ========== TOP BAR (OFFICIAL) ========== */}
      <div className="bg-brand text-white/70 text-[10px] py-1.5 px-6 font-medium tracking-wider uppercase border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><MapPin size={10} /> Campus Sidi Ahmed Zarrouk, Gafsa</span>
            <span className="flex items-center gap-1.5"><Mail size={10} /> contact@isetgf.rnu.tn</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Portail RNU</a>
            <a href="#" className="hover:text-white transition-colors">Ministère MESRS</a>
          </div>
        </div>
      </div>

      {/* ========== INSTITUTIONAL NAV ========== */}
      <nav className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-800 py-3' 
          : 'top-8 md:top-8 bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-xl shadow-accent/20 group-hover:rotate-6 transition-all duration-300">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-xl tracking-tight leading-none transition-colors ${isScrolled ? 'text-brand' : 'text-brand md:text-brand'}`}>ISET GAFSA</span>
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1 transition-colors ${isScrolled ? 'text-slate-400' : 'text-slate-400'}`}>Établissement Public de Formation</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Institut', 'Départements', 'Formation', 'Manifestations', 'Entreprise'].map((item) => (
              <button key={item} className={`text-[11px] font-black uppercase tracking-widest transition-all hover:text-accent relative group ${
                isScrolled ? 'text-slate-600' : 'text-white md:text-slate-600'
              }`}>
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isScrolled ? 'border-slate-200 text-slate-400' : 'border-white/20 text-white/50 md:border-slate-200 md:text-slate-400'
            }`}>
              <Search size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Rechercher</span>
            </div>
            <Link href="/login">
              <Button className="bg-brand hover:brightness-110 text-white rounded-lg px-6 h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/10">
                Accès Extranet
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO (INSTITUTIONAL) ========== */}
      <section className="relative min-h-[75vh] flex flex-col justify-center overflow-hidden bg-white">
        {/* Subtle grid pattern for professionalism */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0f1b2d 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-[1.2fr,0.8fr] gap-16 items-center pt-20">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] bg-accent" />
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Excellence & Innovation</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-6 text-brand tracking-tight">
              Institut Supérieur <br />
              <span className="text-accent italic">des Études</span> <br />
              Technologiques
            </h1>
            
            <p className="text-base md:text-lg text-slate-500 max-w-lg mb-8 leading-relaxed font-medium">
              L&apos;ISET de Gafsa assure une formation scientifique et technologique de haut niveau, favorisant l&apos;insertion professionnelle dans un environnement industriel en constante évolution.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-brand text-white hover:bg-brand/90 px-8 h-12 text-[10px] font-black uppercase tracking-widest">
                  Inscription Académique <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-2 border-slate-200 hover:bg-slate-50 text-brand px-8 h-12 text-[10px] font-black uppercase tracking-widest">
                Structure de l&apos;Institut
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative z-10 rounded-2xl overflow-hidden border-[8px] border-slate-50 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.02] duration-700">
               <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden relative group">
                  <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/0 transition-colors duration-500" />
                  <Building2 size={120} className="text-brand/10" />
                  <div className="absolute bottom-8 left-8 text-brand">
                    <p className="text-5xl font-black mb-1">20+</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Années d&apos;expertise</p>
                  </div>
               </div>
            </div>
            {/* Geometric deco */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-brand/5 rounded-full blur-3xl" />
          </div>
        </div>
      </section>
      
      {/* ========== À PROPOS (INSTITUTIONAL VALUES) ========== */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-12">
                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand mb-6">
                      <Shield size={24} />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-brand mb-3">Qualité</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Engagement continu vers l&apos;excellence académique certifiée.</p>
                  </div>
                  <div className="bg-accent/5 p-8 rounded-[2rem] border border-accent/10 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-accent mb-3">Innovation</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Intégration des technologies de pointe dans le cursus.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-brand/5 p-8 rounded-[2rem] border border-brand/10 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-6">
                      <Globe size={24} />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-brand mb-3">Ouverture</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Partenariats actifs avec le tissu socio-économique.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm pt-12">
                    <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand mb-6">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-brand mb-3">Réussite</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Un taux d&apos;insertion professionnelle parmi les plus hauts.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-[2px] bg-accent" />
                <span className="text-accent text-[11px] font-black uppercase tracking-[0.3em]">Notre Mission</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand dark:text-white mb-8 tracking-tight uppercase leading-tight">
                Forger les Experts de <br />
                <span className="text-accent italic">Demain</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                Depuis sa création, l&apos;Institut Supérieur des Études Technologiques de Gafsa s&apos;est imposé comme un pilier du réseau ISET en Tunisie. Notre approche pédagogique combine rigueur académique et immersion pratique.
              </p>
              <div className="space-y-6 mb-12">
                {[
                  "Formation de cadres techniciens supérieurs hautement qualifiés.",
                  "Promotion de la recherche technologique et l'innovation.",
                  "Coopération étroite avec les partenaires industriels régionaux."
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="text-brand font-black uppercase tracking-widest text-[11px] p-0 hover:bg-transparent hover:gap-4 transition-all">
                Histoire & Chiffres Clés <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES PRATIQUES (NEW OFFICIAL SECTION) ========== */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900 shadow-inner">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-black text-brand dark:text-white mb-4">Services Pratiques</h2>
              <p className="text-slate-400 text-sm font-medium">Accès rapide aux outils et plateformes institutionnelles.</p>
            </div>
            <div className="w-20 h-1 bg-accent/20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {quickServices.map((service, i) => (
              <div key={i} className="group bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 hover:shadow-2xl hover:shadow-brand/5 hover:-translate-y-2 transition-all duration-500 cursor-pointer flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-brand group-hover:text-white transition-all duration-300 shrink-0">
                  <service.icon size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-brand dark:text-white mb-2 leading-tight">{service.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== NOUVEAUTÉS & MANIFESTATIONS ========== */}
      <section className="py-32 bg-slate-50/30 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-24">
            
            {/* LATEST NEWS */}
            <div>
              <div className="flex items-center gap-4 mb-12">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white">
                  <Newspaper size={20} />
                </div>
                <h2 className="text-3xl font-black text-brand dark:text-white uppercase tracking-tight">Nouveautés & Communiqués</h2>
              </div>

              <div className="grid gap-12">
                {[
                  { tag: "AVIS AUX ETUDIANTS", title: "Calendrier des examens du second semestre 2023-2024", date: "09 Mars 2024", desc: "La direction des études communique le planning détaillé des épreuves..." },
                  { tag: "PLAQUETTE PÉDAGOGIQUE", title: "Mise à jour des programmes Licence TI (L1 & L2)", date: "05 Mars 2024", desc: "Consultation des nouveaux modules optionnels pour le semestre prochain." },
                  { tag: "COMMUNIQUÉ", title: "Ouverture des candidatures pour le Mastère Professionnel", date: "01 Mars 2024", desc: "L&apos;ISET Gafsa annonce l&apos;ouverture des inscriptions pour les parcours de mastère." }
                ].map((news, i) => (
                  <div key={news.title} className="group cursor-pointer">
                    <div className="flex gap-4 items-center mb-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-accent/10 text-accent rounded-full">{news.tag}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{news.date}</span>
                    </div>
                    <h3 className="text-xl font-black text-brand dark:text-white group-hover:text-accent transition-colors mb-4">{news.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{news.desc}</p>
                    <div className="w-full h-px bg-slate-100" />
                  </div>
                ))}
              </div>
              
              <Button variant="ghost" className="mt-12 text-accent font-black uppercase tracking-widest text-[10px] p-0 hover:bg-transparent hover:gap-3 transition-all">
                Toutes les actualités <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>

            {/* UPCOMING EVENTS */}
            <div className="lg:sticky lg:top-32 h-fit">
              <div className="bg-brand rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-brand/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                
                <div className="flex items-center gap-4 mb-12">
                  <Calendar size={28} className="text-accent" />
                  <h2 className="text-2xl font-black uppercase tracking-widest">Manifestations</h2>
                </div>

                <div className="space-y-10">
                  {[
                    { day: "15", month: "MAR", title: "Journée Portes Ouvertes 4C", type: "Carrière" },
                    { day: "22", month: "AVR", title: "Séminaire Cybersécurité", type: "Conférence" },
                    { day: "05", month: "MAI", title: "Manifestation Culturelle", type: "Club" }
                  ].map((event, i) => (
                    <div key={i} className="flex gap-8 group cursor-pointer border-b border-white/5 pb-8 last:border-0 last:pb-0">
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-3xl font-black text-accent leading-none mb-1">{event.day}</span>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{event.month}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-2 block">{event.type}</span>
                        <h4 className="font-bold text-base group-hover:text-accent transition-colors leading-snug">{event.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-12 bg-white/10 hover:bg-white text-brand border-0 rounded-2xl h-14 text-xs font-black uppercase tracking-widest transition-all">
                  Calendrier Complet
                </Button>
              </div>

              {/* STATS STRIP INSET */}
              <div className="mt-12 grid grid-cols-2 gap-4">
                {stats.slice(0, 2).map((s, i) => (
                  <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-2xl font-black text-brand mb-1">{s.value}</p>
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== NOS DÉPARTEMENTS (SOLID GRID) ========== */}
      <section className="py-32 bg-brand text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-accent/5 -skew-x-12" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black mb-6 tracking-tight uppercase">Départements d&apos;Enseignement</h2>
              <p className="text-white/50 text-lg">Nos unités académiques assurent des formations spécialisées encadrées par des experts de l&apos;industrie et de la recherche.</p>
            </div>
            <Button className="bg-accent text-white hover:bg-accent/90 rounded-none px-10 h-14 text-xs font-black uppercase tracking-widest border-0">
              Voir tous les parcours
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
            {departments.map((dept, i) => (
              <div key={i} className="group bg-brand p-16 hover:bg-slate-900/50 transition-all duration-700 cursor-pointer border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-16 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 group-hover:text-accent group-hover:bg-accent/10 transition-all duration-500">
                    <dept.icon size={32} />
                  </div>
                  <span className="text-xs font-black text-white/10 tracking-widest group-hover:text-white transition-colors uppercase">{dept.code}</span>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight mb-6 relative z-10">{dept.name}</h3>
                <div className="flex items-center gap-3 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 relative z-10">
                  <span className="text-xs font-black uppercase tracking-widest">Voir Parcours</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ESPACE ENTREPRISE (COOPERATION) ========== */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-accent mb-12 shadow-inner border border-slate-100 dark:border-slate-800">
            <Briefcase size={36} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-brand dark:text-white mb-8 uppercase tracking-tight">Espace Entreprise & Stages</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-3xl text-lg leading-relaxed mb-16">
            La coordination des stages assure le lien entre l&apos;institut et le monde socio-professionnel. Nous accompagnons nos étudiants dans la quête d&apos;excellence pratique et l&apos;immersion dans le tissu économique.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <Button size="lg" className="bg-brand text-white hover:brightness-110 rounded-2xl px-12 h-16 text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand/20 border-0 transition-all">
              Déposer une Offre de Stage
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-brand dark:text-white px-12 h-16 text-xs font-black uppercase tracking-widest transition-all">
              Coordination des Stages
            </Button>
          </div>
          
          <div className="mt-32 pt-32 border-t border-slate-100 dark:border-slate-900 w-full">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-16 opacity-50">Nos Partenaires Privilégiés & Réseaux Professionnels</p>
            <div className="flex flex-wrap justify-center items-center gap-20 md:gap-40 grayscale opacity-30 hover:opacity-60 transition-opacity duration-700">
              {['Microsoft', 'Cisco', 'Orange', 'Huawei', 'Gafsa Phosphate'].map(p => (
                <span key={p} className="text-3xl font-black text-slate-400 tracking-tighter">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ (INSTITUTIONAL) ========== */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-accent/10 text-accent mb-8">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-4xl font-black text-brand dark:text-white mb-6 uppercase tracking-tight">Questions Fréquentes</h2>
            <p className="text-slate-500 font-medium">Réponses aux interrogations courantes sur les services de l&apos;ISET.</p>
          </div>
          
          <div className="space-y-6">
            {[
              { q: "Comment s'inscrire au mastère professionnel ?", a: "Les candidatures se font exclusivement via le portail national de l'ISET Gafsa durant les périodes de recrutement annoncées en Mars et Juin." },
              { q: "Quel est le rôle du centre 4C ?", a: "Le Centre de Carrière et de Certification des Compétences accompagne les étudiants dans leur insertion professionnelle et propose des certifications internationales." },
              { q: "Comment obtenir une attestation de présence ?", a: "Les attestations sont délivrées par le service de scolarité sur présentation de la carte d'étudiant valide pour l'année en cours." },
              { q: "Où consulter les résultats des examens ?", a: "Les résultats sont affichés au sein de l'institut et disponibles via l'accès extranet sécurisé pour chaque étudiant." }
            ].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-brand/5 transition-all cursor-pointer group">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-sm text-brand dark:text-white group-hover:text-accent transition-colors">{faq.q}</h4>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-accent transition-colors" />
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20 p-10 bg-brand rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex gap-6 items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-accent">
                <MessageSquare size={24} />
              </div>
              <div>
                <h5 className="font-black text-lg">Besoin d&apos;assistance ?</h5>
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Contactez notre service scolarité</p>
              </div>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-white rounded-xl h-14 px-10 text-xs font-black uppercase tracking-widest border-0">
              Contacter le Support
            </Button>
          </div>
        </div>
      </section>

      {/* ========== FOOTER (OFFICIAL) ========== */}
      <footer className="bg-brand text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Building2 size={20} className="text-white" />
                </div>
                <span className="font-black text-2xl tracking-tight">ISET GAFSA</span>
              </div>
              <p className="text-white/40 max-w-sm mb-10 leading-relaxed font-medium">
                Institut Supérieur des Études Technologiques de Gafsa. Établissement public à caractère scientifique et technologique sous la tutelle du Ministère de l&apos;Enseignement Supérieur et de la Recherche Scientifique.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-accent mb-10">Administration</h4>
              <ul className="grid gap-4 text-white/50 text-sm font-medium">
                {['Direction des études', 'Secrétariat Général', 'Directeur de l\'Institut', 'Service Scolarité', 'Coordination des stages'].map(link => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-accent mb-10">Contacts Officiels</h4>
              <ul className="grid gap-8 text-white/50 text-sm font-medium">
                <li className="flex gap-4">
                  <MapPin size={24} className="text-accent shrink-0" />
                  <span>Campus Universitaire Sidi Ahmed Zarrouk, Gafsa 2112, Tunisie</span>
                </li>
                <li className="flex gap-4">
                  <Phone size={18} className="text-accent shrink-0" />
                  <span>+216 76 211 500</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              © {new Date().getFullYear()} ISET Gafsa — Direction des Études et des Stages
            </p>
            <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <a href="#" className="hover:text-white transition-colors">Portail National RNU</a>
              <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
