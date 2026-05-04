'use client';

import UsersManager from '@/components/admin/UsersManager';
import { GraduationCap } from 'lucide-react';

export default function TeachersPage() {
  return (
    <UsersManager
      roleFilter="TEACHER"
      title="Enseignants"
      description="Consultez et gérez la liste complète de tous les enseignants."
      badgeIcon={GraduationCap}
    />
  );
}
