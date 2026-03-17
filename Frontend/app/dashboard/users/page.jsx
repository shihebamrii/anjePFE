'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading';
import { userService } from '@/services/userService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, getRoleBadge } from '@/lib/utils';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try { setUsers(await userService.getUsers(roleFilter)); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    setLoading(true);
    fetchData();
  }, [roleFilter]);

  if (loading) return <LoadingPage />;

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const ROLES = ['', 'ADMIN', 'TEACHER', 'STUDENT', 'PARTNER'];
  const ROLE_LABELS = { '': 'Tous', ADMIN: 'Admin', TEACHER: 'Enseignants', STUDENT: 'Étudiants', PARTNER: 'Partenaires' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <Users size={24} className="text-accent" /> Utilisateurs
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Gestion des comptes utilisateurs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(role => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === role ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}>{ROLE_LABELS[role]}</button>
          ))}
        </div>
      </div>

      <Card className="border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rôle</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Département</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  return (
                    <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px]">{getInitials(u.firstName, u.lastName)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="p-4"><Badge className={roleBadge.class + " text-[10px]"}>{roleBadge.label}</Badge></td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{u.department || '—'}</td>
                      <td className="p-4"><Badge variant={u.isActive !== false ? 'success' : 'danger'} className="text-[10px]">{u.isActive !== false ? 'Actif' : 'Inactif'}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-12">Aucun utilisateur</p>}
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-slate-400 text-center">{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  );
}
