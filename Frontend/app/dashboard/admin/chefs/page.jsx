'use client';

import UsersManager from '@/components/admin/UsersManager';
import { Building2 } from 'lucide-react';

export default function ChefsPage() {
  return (
    <UsersManager
      roleFilter="CHEF_DEPT"
      title="Chefs de Département"
      description="Gérez les chefs de département, leurs informations et accès."
      badgeIcon={Building2}
    />
  );
}
