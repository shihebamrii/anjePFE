'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Mail, Lock, Loader2, ArrowRight, Sparkles, GraduationCap, Users, Calendar, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard/student');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(formData.email, formData.password);
      const routes = {
        ADMIN: '/dashboard/admin',
        TEACHER: '/dashboard/teacher',
        STUDENT: '/dashboard/student',
        PARTNER: '/dashboard/partner',
        CHEF_DEPT: '/dashboard/chef',
      };
      router.push(routes[data.role] || '/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: GraduationCap, text: 'Notes & Résultats' },
    { icon: Users, text: 'Suivi de Présences' },
    { icon: Briefcase, text: 'Offres de Stages' },
    { icon: Calendar, text: 'Actualités Campus' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT PANEL ===== */}
      <div className="hidden lg:flex lg:w-[55%] gradient-hero-mesh relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/[0.04] blur-2xl animate-float" />
        <div className="absolute bottom-32 left-16 w-80 h-80 rounded-full bg-accent/[0.06] blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[50%] left-[50%] w-32 h-32 rounded-full bg-cyan-400/[0.05] blur-2xl animate-float" style={{ animationDelay: '-4s' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-white/[0.08] backdrop-blur-md flex items-center justify-center border border-white/[0.08]">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ISET Gafsa</h1>
              <p className="text-white/40 text-[11px] font-medium">Institut Supérieur des Études Technologiques</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[2.75rem] font-black leading-[1.1] mb-5 tracking-tight">
            Votre portail{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              universitaire
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-sm leading-relaxed mb-10">
            Accédez à vos notes, emplois du temps, actualités et opportunités de stage en un seul endroit.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/60 group animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center border border-white/[0.06] group-hover:bg-accent/20 transition-colors">
                  <f.icon size={14} />
                </div>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface dark:bg-slate-950">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-elevated mb-4">
              <Building2 className="text-white" size={22} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">ISET Gafsa</h1>
            <p className="text-slate-400 text-xs">Institut Supérieur des Études Technologiques</p>
          </div>

          {/* Login card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200/60 dark:border-slate-800 p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Connexion</h2>
              <p className="text-slate-400 text-sm mt-1.5">Accédez à votre espace personnel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-800 p-3.5 rounded-xl text-sm text-center font-medium animate-scale-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-12"
                    placeholder="votre.email@iset.tn"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 h-12"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-[15px] mt-2" variant="accent">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-7 text-center">
              <p className="text-slate-400 text-sm">
                Pas encore de compte ?{' '}
                <a href="/register" className="text-accent font-semibold hover:underline">
                  S&apos;inscrire
                </a>
              </p>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-8">
            © 2024 ISET Gafsa. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
