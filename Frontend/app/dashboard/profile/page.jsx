'use client'; // Instructs Next.js to compile and render this file on the client-side (in the browser)

import { useState, useEffect } from 'react'; // React state hooks for lifecycle methods and reactive parameters
import { useAuth } from '@/context/AuthContext'; // Custom hook to access authentication context state variables
import { Card, CardContent } from '@/components/ui/card'; // Custom UI components for card layout containers
import { Badge } from '@/components/ui/badge'; // Custom UI badge labels component
import { LoadingPage } from '@/components/ui/loading'; // Custom loading page transition component
import { authService } from '@/services/authService'; // Helper functions to fetch user profile database details
import { gradeService } from '@/services/gradeService'; // Helper functions to retrieve student grades
import { attendanceService } from '@/services/attendanceService'; // Helper functions to retrieve student attendance reports
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Custom avatar profile image layout components
import { getInitials, getRoleBadge, calculateAverage, getAttendanceRate, formatDate } from '@/lib/utils'; // Profile helpers to format names, role badges, averages, attendance, and dates
import { User, Mail, Building2, GraduationCap, ClipboardCheck, Calendar, IdCard } from 'lucide-react'; // Vector icons assets

export default function ProfilePage() {
  // --- Auth Checks ---
  const { user, isStudent } = useAuth(); // Extract user object and student checker flag from context

  // --- React State Declarations ---
  const [profile, setProfile] = useState(null); // Detailed user profile dataset retrieved from API
  const [grades, setGrades] = useState([]); // List of grades (populated only if user role is student)
  const [attendance, setAttendance] = useState([]); // List of attendance records (populated only if student)
  const [loading, setLoading] = useState(true); // Full screen loading transition state flag

  // Fetch detailed user profile information and student metrics once on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const p = await authService.getProfile().catch(() => null); // Fetch detailed database record
        setProfile(p);
        
        // If logged-in user is a student, fetch their grades and attendance statistics
        if (isStudent) {
          const [g, a] = await Promise.all([
            gradeService.getGrades().catch(() => []),
            attendanceService.getAttendance().catch(() => []),
          ]);
          setGrades(g); 
          setAttendance(a);
        }
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); // Terminate spinner screen loading state
      }
    }
    fetchData();
  }, [isStudent]); // Trigger effect fetch logic if student status shifts

  // Show loading indicator page if query fetches are pending
  if (loading) return <LoadingPage message="Chargement du profil..." />;

  // Select either backend profile details object or auth user fallback object
  const displayUser = profile || user;
  
  // Retrieve custom CSS styles classes and readable role label tag
  const roleBadge = getRoleBadge(displayUser?.role);
  
  // Calculate average scores and attendance rates dynamically
  const avg = isStudent ? calculateAverage(grades) : null;
  const attendRate = isStudent ? getAttendanceRate(attendance) : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Title section with icon header */}
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
        <User size={24} className="text-accent" /> Mon Profil
      </h1>

      {/* Main Profile Info Card element */}
      <Card className="overflow-hidden border-0">
        {/* Banner background layout placeholder */}
        <div className="h-32 gradient-hero-mesh relative">
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            {/* Avatar circular initials wrapper */}
            <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-lg ring-0">
              <AvatarFallback className="text-2xl">{getInitials(displayUser?.firstName, displayUser?.lastName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Name and profile descriptors section */}
        <CardContent className="pt-14 pb-6 px-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{displayUser?.firstName} {displayUser?.lastName}</h2>
            <Badge className={roleBadge.class + " mt-1"}>{roleBadge.label}</Badge>
          </div>
          
          {/* Metadata detail block grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {[
              { icon: Mail, label: 'Email', value: displayUser?.email },
              { icon: Building2, label: 'Département', value: displayUser?.department || 'N/A' },
              displayUser?.studentId && { icon: IdCard, label: 'ID Étudiant', value: displayUser.studentId },
              { icon: Calendar, label: 'Membre depuis', value: formatDate(displayUser?.createdAt) },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <item.icon size={17} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Renders dynamic progress cards block only if user role is a student */}
      {isStudent && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: GraduationCap, label: 'Moyenne Générale', value: `${avg} / 20`, gradient: 'from-blue-500 to-cyan-600' },
            { icon: ClipboardCheck, label: 'Taux de Présence', value: `${attendRate}%`, gradient: 'from-emerald-500 to-teal-600' },
          ].map((s, i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-5 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md mx-auto mb-3`}>
                  <s.icon className="text-white" size={22} />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{s.value}</p>
                <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

