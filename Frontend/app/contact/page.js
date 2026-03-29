import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function GenericContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-brand text-white pt-24 pb-32 px-4 sm:px-6 relative text-center">
        <div className="max-w-2xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour
          </Link>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6">Contacter l'<em className="text-gold" style={{ fontStyle: 'italic' }}>Institut</em></h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Notre administration et notre service d'assistance sont à votre écoute pour toute demande d'information.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-[-60px] relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand/5 border border-slate-200/60 p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Contact Info */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand mb-8">Coordonnées</h2>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand mb-1">Adresse</h4>
                    <p className="text-sm text-slate-500">ISET Gafsa, Campus Sidi Ahmed Zarrouk, Gafsa 2112, Tunisie</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand mb-1">Téléphone</h4>
                    <p className="text-sm text-slate-500">+216 76 211 500 / +216 76 211 505</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand mb-1">Email</h4>
                    <p className="text-sm text-slate-500">contact@isetgf.rnu.tn</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand mb-1">Horaires (Scolarité)</h4>
                    <p className="text-sm text-slate-500">Du Lundi au Vendredi<br/>08h00 - 14h00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand mb-8">Envoyer un message</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Votre nom" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Votre email" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sujet / Motif</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-600">
                    <option>Scolarité et Inscription</option>
                    <option>Demande de Stage</option>
                    <option>Problème Technique (Extranet)</option>
                    <option>Autre Information</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Message</label>
                  <textarea rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                </div>
                <button type="button" className="w-full py-4 mt-2 bg-brand text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-light transition-colors shadow-lg">
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
