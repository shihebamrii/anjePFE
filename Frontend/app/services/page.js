import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, Shield, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    { title: 'Centre 4C', icon: Sparkles, desc: 'Centre de Carrière et de Certification des Compétences. Préparation à la vie professionnelle.' },
    { title: 'Bibliothèque Digitale', icon: BookOpen, desc: 'Accédez à des milliers de ressources pédagogiques, thèses, et rapports de stage.' },
    { title: 'Qualité (PAQ)', icon: Shield, desc: 'Programme d\'Appui à la Qualité pour l\'amélioration continue des prestations universitaires.' },
    { title: 'Formation Continue', icon: GraduationCap, desc: 'Développement de compétences pour les professionnels cherchant à se requalifier.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200/60 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand transition-colors text-sm font-semibold mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
          </Link>
          
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand mb-6">Plateformes & <em className="text-gold" style={{ fontStyle: 'italic' }}>Services</em></h1>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            Consultez l'ensemble des services mis à disposition des étudiants et du corps enseignant de l'ISET Gafsa.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {services.map((svc, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all flex gap-6 items-start group">
              <div className="w-14 h-14 rounded-2xl bg-brand/5 text-brand flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:text-white transition-colors">
                <svc.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-brand mb-2">{svc.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                <button className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">Accéder →</button>
              </div>
            </div>
          ))}
        </div>

        {/* Generic Contact Card for the page footer */}
        <div className="bg-brand rounded-[2rem] p-10 text-white flex flex-col md:flex-row justify-between items-center shadow-xl">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h4 className="font-serif text-2xl mb-2">Besoin d'aide avec un service ?</h4>
            <p className="text-white/60 text-sm">Notre équipe de scolarité est à votre disposition.</p>
          </div>
          <div className="flex gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl"><Phone size={16}/> 76 211 500</div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl"><Mail size={16}/> contact@isetgf.rnu.tn</div>
          </div>
        </div>
      </main>
    </div>
  );
}
