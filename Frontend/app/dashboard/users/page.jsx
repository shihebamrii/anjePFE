'use client'; // Tells Next.js to compile and execute this file as a client-side component

import UsersManager from '@/components/admin/UsersManager'; // Import the shared UsersManager panel component
import { Users } from 'lucide-react'; // Vector icon asset representing user directories

export default function UsersPage() {
  return (
    // Render the UsersManager wrapper configured to display and manage all system account roles
    <UsersManager
      roleFilter="" // Empty filter displays all roles (Students, Teachers, Admins, Chefs, Partners)
      title="Tous les Utilisateurs" // Header title configuration parameter
      description="Gérez l'ensemble des comptes utilisateurs de la plateforme." // Subtitle description description parameter
      badgeIcon={Users} // Visual header icon decoration parameter
    />
  );
}

