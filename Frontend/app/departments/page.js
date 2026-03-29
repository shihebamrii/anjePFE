import Link from 'next/link';
import { ArrowLeft, Monitor, Zap, Wrench, Building2, FlaskConical, BarChart3, ChevronRight } from 'lucide-react';

export default function DepartmentsPage() {
  const departments = [
    { name: 'Technologies de l\'Informatique', code: 'TI', icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Génie logiciel, Réseaux, Sécurité et Multimédia.' },
    { name: 'Génie Électrique', code: 'GE', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Automatisme, Électronique, et Systèmes Embarqués.' },
    { name: 'Génie Mécanique', code: 'GM', icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-100', desc: 'Conception, Fabrication et Maintenance Industrielle.' },
    { name: 'Génie Civil', code: 'GC', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Bâtiment, Travaux Publics et Topographie.' },
    { name: 'Génie des Procédés', code: 'GP', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Chimie Industrielle, Environnement et Matériaux.' },
    { name: 'Sciences Économiques et Gestion', code: 'SEG', icon: BarChart3, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Commerce électronique, Marketing et Finance.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-brand text-white pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-gold" />
            <span className="text-gold text-[11px] font-bold uppercase tracking-[0.3em]">Formation Académique</span>
            <div className="w-8 h-[2px] bg-gold" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Départements & <em className="text-gold" style={{ fontStyle: 'italic' }}>Filières</em>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Découvrez nos 6 départements d'enseignement offrant des parcours de Licence Appliquée et de Mastère Professionnel adaptés aux besoins du marché.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-[-40px] relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group cursor-pointer flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl ${dept.bg} ${dept.color} flex items-center justify-center shrink-0`}>
                  <dept.icon size={24} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-100 py-1.5 px-3 rounded-full group-hover:bg-brand group-hover:text-gold transition-colors">
                  {dept.code}
                </span>
              </div>
              
              <h3 className="font-serif text-2xl font-bold text-brand mb-3 group-hover:text-blue-700 transition-colors">
                {dept.name}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                {dept.desc}
              </p>
              
              <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-widest mt-auto group-hover:translate-x-1 transition-transform">
                Explorer le parcours <ChevronRight size={14} className="text-gold" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
