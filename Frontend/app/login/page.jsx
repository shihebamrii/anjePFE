'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail, Lock, Loader2, ArrowRight, GraduationCap, Users,
  Calendar, Briefcase, Shield, ChevronRight, Eye, EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const routes = {
        ADMIN: '/dashboard/admin',
        TEACHER: '/dashboard/teacher',
        STUDENT: '/dashboard/student',
        PARTNER: '/dashboard/partner',
        CHEF_DEPT: '/dashboard/chef',
      };
      router.push(routes[user.role] || '/dashboard/student');
    }
  }, [isAuthenticated, user, router]);

  // Form validation based on backend schema
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

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
    { icon: GraduationCap, text: 'Notes & Résultats', desc: 'Consultez vos relevés' },
    { icon: Users, text: 'Suivi de Présences', desc: 'En temps réel' },
    { icon: Briefcase, text: 'Offres de Stages', desc: 'Opportunités PFE' },
    { icon: Calendar, text: 'Actualités Campus', desc: 'Événements & news' },
  ];

  return (
    <div className="h-screen flex font-sans selection:bg-blue-200/40" suppressHydrationWarning>

      {/* ===== LEFT PANEL — Cinematic Branded Side ===== */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] bg-brand relative overflow-hidden">
        {/* Background hero image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/hero_image.png"
            alt="Campus ISET Gafsa"
            fill
            className="object-cover opacity-20"
            sizes="(max-width: 1024px) 0vw, 50vw"
          />
        </div>
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand/95 to-brand-dark" />
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} />
        
        {/* Decorative glow effects */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-gold/10 blur-[100px]" />
        <div className="absolute bottom-32 left-16 w-80 h-80 rounded-full bg-blue-500/8 blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between px-14 xl:px-20 py-12 w-full">
          {/* Top — Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
              <Image src="/logo.jpeg" alt="ISET" width={44} height={44} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">ISET GAFSA</h1>
              <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Établissement Public</p>
            </div>
          </Link>

          {/* Center — Hero Content */}
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] bg-gold" />
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Espace Extranet</span>
            </div>
            
            <h2 className="font-serif text-[2.75rem] xl:text-[3.25rem] font-bold text-white leading-[1.05] mb-6 tracking-tight">
              Votre portail<br />
              <em className="text-gold" style={{ fontStyle: 'italic' }}>universitaire</em>
            </h2>
            
            <p className="text-white/40 text-base leading-relaxed mb-10 max-w-sm">
              Accédez à vos notes, emplois du temps, actualités et opportunités de stage depuis un espace unifié et sécurisé.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className="group flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-2xl px-4 py-3.5 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-gold/80 group-hover:text-gold group-hover:bg-gold/10 transition-colors shrink-0">
                    <f.icon size={16} />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white/80 leading-tight">{f.text}</p>
                    <p className="text-[10px] text-white/30 font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Trust indicators */}
          <div className="flex items-center gap-3">
            <Shield size={14} className="text-gold/40" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              Connexion sécurisée — Réseau Universitaire National
            </span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="flex-1 bg-white relative overflow-y-auto">
        <div className="flex flex-col justify-center min-h-full p-6 sm:p-10">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="w-full max-w-[400px] mx-auto relative z-10">
          
          {/* Mobile logo — visible on small screens only */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg">
                <Image src="/logo.jpeg" alt="ISET Gafsa" width={56} height={56} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-black text-brand tracking-tight">ISET GAFSA</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Établissement Public</p>
              </div>
            </Link>
          </div>

          {/* Form Container */}
          <div className="w-full mt-6 sm:mt-8">
            
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Connexion</h1>
              <p className="text-sm text-slate-500">Accédez à votre espace personnel</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200/80 p-3.5 rounded-xl text-sm text-center font-semibold animate-scale-in flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-10"
                    placeholder="votre.email@iset.tn"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 h-10"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full mt-4"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se connecter
              </Button>
            </form>


          </div>

          {/* Footer */}
          <div className="mt-8 text-center pb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
              © {new Date().getFullYear()} ISET Gafsa — Direction des Études et des Stages
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
