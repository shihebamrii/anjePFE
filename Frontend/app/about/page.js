// Import Link component from Next.js for client-side navigation
import Link from 'next/link';
// Import icons from lucide-react library for UI decorations
import { ArrowLeft, Building2, Users, Star, Target, Shield, History } from 'lucide-react';
// Import custom Button component
import { Button } from '@/components/ui/button';

// Main export of the About page view
export default function AboutPage() {
  return (
    // Outer container wrapper with light gray background and page padding
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200/40 text-slate-900 pb-20">
      
      {/* ═══════════ HEADER ═══════════ */}
      {/* Branded header block with dark color background and radial background light decoration */}
      <header className="bg-brand text-white pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative radial overlay pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        {/* Soft glowing circular accent overlay */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
        
        {/* Inner header container with relative layout to overlay background shapes */}
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back button redirecting back to landing page */}
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
          
          {/* Subsection label with gold divider line */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-gold" />
            <span className="text-gold text-[11px] font-bold uppercase tracking-[0.3em]">Découvrir l'ISET</span>
          </div>
          {/* Main heading title for the about page */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Présentation de<br />l'<em className="text-gold" style={{ fontStyle: 'italic' }}>Institut</em>
          </h1>
          {/* Brief introductory description paragraph */}
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Plongez dans l'histoire, la mission et l'organisation de l'Institut Supérieur des Études Technologiques de Gafsa. Une institution dédiée à l'excellence académique depuis 2000.
          </p>
        </div>
      </header>
  
      {/* ═══════════ CONTENT ═══════════ */}
      {/* Main content body nested in a white card container, offset upwards into the header banner */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 mt-[-40px] relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand/5 border border-slate-200/60 p-8 sm:p-12 md:p-16 mb-16">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left side text content detailing the institute history */}
            <div>
              {/* Building icon card container */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-8">
                <Building2 size={28} />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand mb-6">Notre Histoire</h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Créé en 2000, l'Institut Supérieur des Études Technologiques de Gafsa a pour vocation de former des techniciens supérieurs hautement qualifiés. Fort de son ancrage régional, l'institut participe activement au développement socio-économique du sud-ouest tunisien.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Notre mission s'articule autour de l'innovation pédagogique, l'ouverture sur le monde professionnel et l'adaptation continue aux mutations technologiques mondiales.
              </p>
            </div>
            
            {/* Right side stats grid with numeric indicators */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Fondation', value: '2000', icon: History },
                { label: 'Taux de réussite', value: '98%', icon: Star },
                { label: 'Partenaires', value: '45+', icon: Target },
                { label: 'Qualité', value: 'Certifié', icon: Shield },
              ].map((stat, i) => (
                // Individual stat card
                <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl group hover:border-blue-200 transition-colors">
                  {/* Decorative Icon */}
                  <stat.icon size={24} className="text-brand/40 mb-4 group-hover:text-gold transition-colors" />
                  {/* Numeric representation */}
                  <p className="font-serif text-3xl font-bold text-brand mb-1">{stat.value}</p>
                  {/* Stat text label */}
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════ ADMINISTRATION ═══════════ */}
        {/* Administrative management team details section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-brand mb-4">Équipe Dirigeante</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Une administration dévouée à la réussite de nos étudiants et au rayonnement de l'institut.</p>
          </div>
          
          {/* Grid display of key administrators and their roles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { role: 'Directeur de l\'Institut', name: 'Direction ISET', desc: 'Gestion générale et représentation académique' },
              { role: 'Secrétaire Général', name: 'Administration', desc: 'Gestion financière, ressources humaines et logistique' },
              { role: 'Direction des Études', name: 'Scolarité', desc: 'Organisation pédagogique et coordination des départements' },
            ].map((member, i) => (
              // Individual administrator card representation
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                {/* Users icon wrap */}
                <div className="w-12 h-12 bg-blue-50 text-brand rounded-full flex items-center justify-center mb-6">
                  <Users size={20} />
                </div>
                {/* Role title */}
                <h3 className="text-sm font-bold uppercase tracking-widest text-gold mb-2">{member.role}</h3>
                {/* Name */}
                <h4 className="font-serif text-2xl text-brand mb-3">{member.name}</h4>
                {/* Brief description of task assignment */}
                <p className="text-slate-500 text-sm leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
