'use client';

import UsersManager from '@/components/admin/UsersManager';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <UsersManager
      roleFilter=""
      title="Tous les Utilisateurs"
      description="Gérez l'ensemble des comptes utilisateurs de la plateforme."
      badgeIcon={Users}
    />
  );
}
