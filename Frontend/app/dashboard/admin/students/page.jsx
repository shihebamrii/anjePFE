'use client'; // Client interactive component

// Import general users manager table component
import UsersManager from '@/components/admin/UsersManager';
// Import users group decoration icon
import { Users } from 'lucide-react';

// Page component displaying registered student profiles
export default function StudentsPage() {
  return (
    // Load manager filtering specifically by STUDENT role type
    <UsersManager
      roleFilter="STUDENT" // Pull only accounts tagged with student role
      title="Etudiants" // Header title
      description="Gerez les etudiants et recherchez-les facilement avec le filtre." // Info subtext
      badgeIcon={Users} // Group icon badge
    />
  );
}
