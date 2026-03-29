import Link from 'next/link';
import { ArrowLeft, Briefcase, ChevronRight, FileCheck, Building } from 'lucide-react';

export default function StagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-brand text-white pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center text-gold mb-6">
            <Briefcase size={32} />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
            Espace Stages & <em className="text-gold" style={{ fontStyle: 'italic' }}>PFE</em>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Consultez les offres de stages, soumettez vos demandes de Projet de Fin d'Études (PFE) et accédez à notre réseau de partenaires industriels.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="font-serif text-2xl text-brand mb-6">Dernières Offres de Stage</h2>
          
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Building size={24} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-brand">Développeur Full-Stack (Stage PFE)</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Nouveau</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Entreprise Partenaire • Gafsa, Tunisie</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span className="bg-slate-50 px-2 py-1 rounded">React</span>
                  <span className="bg-slate-50 px-2 py-1 rounded">Node.js</span>
                  <span className="bg-slate-50 px-2 py-1 rounded">Durée: 6 mois</span>
                </div>
              </div>
            </div>
          ))}
          
          <button className="w-full py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-widest transition-colors">
            Voir toutes les offres (12)
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <FileCheck size={24} />
            </div>
            <h3 className="font-bold text-xl text-brand mb-4">Portail Démarches</h3>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-gold" /> Convention de stage</li>
              <li className="flex items-center gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-gold" /> Fiche d'évaluation</li>
              <li className="flex items-center gap-2 text-sm text-slate-600"><ChevronRight size={14} className="text-gold" /> Dépôt de rapport PFE</li>
            </ul>
            <Link href="/login" className="block w-full py-3 bg-brand text-white text-center rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-light transition-colors">
              Connexion Extranet
            </Link>
          </div>

          <div className="bg-gold rounded-3xl p-8 text-brand relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Briefcase size={120} />
            </div>
            <h3 className="font-bold text-xl mb-3 relative z-10">Vous êtes une entreprise ?</h3>
            <p className="text-sm font-medium opacity-80 mb-6 relative z-10">Proposez vos offres de stages ou PFE à nos étudiants.</p>
            <button className="w-full py-3 bg-white text-brand rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm relative z-10">
              Déposer une offre
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
