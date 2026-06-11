'use client'; // Client-side interactivity enabled

// Import reusable UsersManager component to display and control accounts list
import UsersManager from '@/components/admin/UsersManager';
// Import building icon to decoration chefs header
import { Building2 } from 'lucide-react';

// Page component to display department heads list
export default function ChefsPage() {
  return (
    // Render user manager filter list specifically for CHEF_DEPT roles
    <UsersManager
      roleFilter="CHEF_DEPT" // Only load accounts matching Chef de Département role
      title="Chefs de Département" // Page main header text
      description="Gerez les chefs de departement, leurs informations et acces." // Brief explanation under header
      badgeIcon={Building2} // Use building icon in badge widget headers
    />
  );
}
