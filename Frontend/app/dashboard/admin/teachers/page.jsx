'use client'; // Client-side execution directive

// Import user list manager component
import UsersManager from '@/components/admin/UsersManager';
// Import graduation cap icon for decoration
import { GraduationCap } from 'lucide-react';

// Page component to display teachers lists
export default function TeachersPage() {
  return (
    // Render list targeting TEACHER roles
    <UsersManager
      roleFilter="TEACHER" // Fetch accounts matching Teacher role
      title="Enseignants" // Title text
      description="Consultez et gerez la liste complete de tous les enseignants." // Subtitle description
      badgeIcon={GraduationCap} // Graduation cap icon decoration
    />
  );
}
