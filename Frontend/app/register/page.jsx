'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import {
  User, Mail, Lock, Loader2, ArrowRight, ArrowLeft,
  GraduationCap, BookOpen, Building2, Eye, EyeOff,
  CheckCircle2, ChevronRight
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation based on backend models/User.js schema
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password.length >= 6;
  const isConfirmPasswordValid = formData.password === formData.confirmPassword;
  const isNameValid = formData.firstName.trim().length > 0 && formData.lastName.trim().length > 0;
  const isFormValid = isEmailValid && isPasswordValid && isConfirmPasswordValid && isNameValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Veuillez remplir correctement tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally { setLoading(false); }
  };

  const roles = [
    { value: 'STUDENT', label: 'Étudiant', icon: GraduationCap, desc: 'Accès notes & présences', color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 'TEACHER', label: 'Enseignant', icon: BookOpen, desc: 'Gérer vos classes', color: 'text-amber-600', bg: 'bg-amber-50' },
    { value: 'PARTNER', label: 'Partenaire', icon: Building2, desc: 'Publier des offres', color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

          {/* Center — Content */}
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] bg-gold" />
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Rejoindre l'ISET</span>
            </div>

            <h2 className="font-serif text-[2.75rem] xl:text-[3.25rem] font-bold text-white leading-[1.05] mb-6 tracking-tight">
              Créez votre<br />
              <em className="text-gold" style={{ fontStyle: 'italic' }}>compte</em>
            </h2>

            <p className="text-white/40 text-base leading-relaxed mb-10 max-w-sm">
              Rejoignez la communauté universitaire de l'ISET Gafsa et accédez à l'ensemble des services numériques de l'institut.
            </p>

            {/* Benefits list */}
            <div className="space-y-4">
              {[
                'Consultation des notes et résultats en temps réel',
                'Suivi de présence et emplois du temps',
                'Accès aux offres de stages et PFE',
                'Actualités et événements du campus',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 text-white/50">
                  <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} className="text-gold" />
                  </div>
                  <span className="text-[13px] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Back to login */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="flex items-center gap-2 text-white/30 hover:text-white/60 text-[11px] font-bold uppercase tracking-widest transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Registration Form ===== */}
      <div className="flex-1 bg-white relative overflow-y-auto">
        <div className="flex flex-col justify-center min-h-full p-6 sm:p-10">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="w-full max-w-md xl:max-w-lg mx-auto relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
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
          <div className="w-full mt-4 sm:mt-6">

            {/* Header */}
            <div className="flex flex-col space-y-2 text-center mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inscription</h1>
              <p className="text-sm text-slate-500">Rejoignez la communauté ISET Gafsa</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200/80 p-3.5 rounded-xl text-sm text-center font-semibold animate-scale-in flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-slate-700">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 h-10"
                      placeholder="Prénom"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-slate-700">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 h-10"
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-10"
                    placeholder="votre.email@iset.tn"
                    required
                  />
                </div>
              </div>

              {/* Password fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-slate-700">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-10"
                      placeholder="••••••"
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
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-slate-700">Confirmer</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 h-10"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Role selection — Premium cards */}
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none text-slate-700">Votre rôle</label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map(r => {
                    const isActive = formData.role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r.value })}
                        className={`flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all ${isActive
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-muted hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <r.icon className="mb-2 h-6 w-6" />
                        <span className="text-xs font-semibold">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full mt-4"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer le compte
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="text-center text-sm">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Se connecter
              </Link>
            </div>
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
