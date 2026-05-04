'use client';

import UsersManager from '@/components/admin/UsersManager';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  return (
    <UsersManager
      roleFilter="STUDENT"
      title="Étudiants"
      description="Gérez les étudiants et recherchez-les facilement avec le filtre."
      badgeIcon={Users}
    />
  );
}
