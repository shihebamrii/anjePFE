'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, User, Mail, Lock, Loader2, ArrowRight, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
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
    { value: 'STUDENT', label: 'Étudiant', icon: '🎓', desc: 'Accès aux notes et présences' },
    { value: 'TEACHER', label: 'Enseignant', icon: '📚', desc: 'Gérez vos classes' },
    { value: 'PARTNER', label: 'Partenaire', icon: '🏢', desc: 'Publiez des offres de stage' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-slate-950 p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-elevated mb-4">
            <Building2 className="text-white" size={22} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">ISET Gafsa</h1>
          <p className="text-slate-400 text-xs">Créer un nouveau compte</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200/60 dark:border-slate-800 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center justify-center gap-2">
              <UserPlus size={22} className="text-accent" /> Inscription
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">Rejoignez la communauté ISET Gafsa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-800 p-3.5 rounded-xl text-sm text-center font-medium animate-scale-in">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="pl-10" placeholder="Prénom" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Nom</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="pl-10" placeholder="Nom" required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" placeholder="votre.email@iset.tn" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10" placeholder="••••••" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Confirmer</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="pl-10" placeholder="••••••" required />
                </div>
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Votre rôle</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setFormData({ ...formData, role: r.value })}
                    className={`p-3 rounded-xl text-center border-2 transition-all ${
                      formData.role === r.value
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}>
                    <span className="text-xl mb-1 block">{r.icon}</span>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{r.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} variant="accent" className="w-full h-12 text-[15px]">
              {loading ? <><Loader2 className="animate-spin" size={18} /> Inscription...</> : <>Créer le compte <ArrowRight size={18} /></>}
            </Button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-slate-400 text-sm">
              Déjà un compte ? <a href="/login" className="text-accent font-semibold hover:underline">Se connecter</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
