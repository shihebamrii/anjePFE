import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Search } from 'lucide-react';

export default function GenericActualitesEventsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-brand text-white pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
          </Link>
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
              Actualités & <em className="text-gold" style={{ fontStyle: 'italic' }}>Événements</em>
            </h1>
            <div className="hidden sm:flex items-center bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Search size={16} className="text-white/50 mr-2" />
              <input type="text" placeholder="Rechercher..." className="bg-transparent text-sm text-white focus:outline-none placeholder:text-white/30" />
            </div>
          </div>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Restez informé de toutes les manifestations, activités culturelles et actualités de l'ISET Gafsa.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        {/* Placeholder grid for news/events articles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer group flex flex-col h-full">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand/5 group-hover:bg-transparent transition-colors z-10" />
                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 shadow-sm flex flex-col items-center">
                  <span className="text-xs font-bold text-blue-600 uppercase">Avr</span>
                  <span className="text-lg font-serif font-black text-brand leading-none">{10 + i}</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold mb-3 block">
                  {i % 2 === 0 ? 'Actualité' : 'Événement'}
                </span>
                <h3 className="font-serif text-xl font-bold text-brand mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                  Lorem ipsum dolor sit amet consectetur adipiscing ISET.
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
                <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  {i % 2 !== 0 && <><MapPin size={14} className="text-slate-300" /> Amphi A</>}
                  {i % 2 === 0 && <><Calendar size={14} className="text-slate-300" /> Publié il y a 2 jours</>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <button className="px-8 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand uppercase tracking-widest transition-colors shadow-sm">
            Charger plus
          </button>
        </div>
      </main>
    </div>
  );
}
