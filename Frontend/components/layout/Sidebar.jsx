'use client';

// Import custom auth context hook to get the logged-in user profile/role
import { useAuth } from '@/context/AuthContext';
// Import router hooks for client-side navigation and active path checking
import { useRouter, usePathname } from 'next/navigation';
// Import React state hooks and event lifecycle hook
import { useState, useEffect } from 'react';
// Import Next.js Link component for fast client-side routing
import Link from 'next/link';
// Import Lucide icons to represent navigation links
import {
  LayoutDashboard, GraduationCap, ClipboardCheck, Newspaper,
  Calendar, Briefcase, Users, User, LogOut, Menu,
  ChevronLeft, Building2, BookOpen, School, MapPin, CalendarDays, MessageSquare, AlertTriangle
} from 'lucide-react';
// Import helper to join conditionally styled utility classes
import { cn } from '@/lib/utils';
// Import Sheet components from Shadcn UI library for mobile sliding sidebar panel
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// Define different navigation items lists tailored specifically for each user role
const navItems = {
  ADMIN: [
    { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard }, // Dashboard
    { href: '/dashboard/admin/departments', label: 'Départements', icon: Building2 }, // Departments
    { href: '/dashboard/admin/chefs', label: 'Chefs de Dép.', icon: Users }, // Dept Heads
    { href: '/dashboard/admin/teachers', label: 'Enseignants', icon: GraduationCap }, // Teachers
    { href: '/dashboard/admin/students', label: 'Étudiants', icon: Users }, // Students
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper }, // News
    { href: '/dashboard/events', label: 'Événements', icon: Calendar }, // Events
    { href: '/dashboard/stages', label: 'Stages', icon: Briefcase }, // Internships
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare }, // Chat messenger
    { href: '/dashboard/profile', label: 'Profil', icon: User }, // User profile settings
  ],
  TEACHER: [
    { href: '/dashboard/teacher', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/teacher/schedule', label: 'Mon Emploi', icon: CalendarDays }, // Teacher Timetable
    { href: '/dashboard/teacher/courses', label: 'Mes Cours', icon: BookOpen }, // Teacher Assigned Courses
    { href: '/dashboard/grades', label: 'Notes', icon: GraduationCap }, // Input Grades
    { href: '/dashboard/attendance', label: 'Présences', icon: ClipboardCheck }, // Log Attendance
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  STUDENT: [
    { href: '/dashboard/student', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/student/schedule', label: 'Mon Emploi', icon: CalendarDays }, // Student Timetable
    { href: '/dashboard/grades', label: 'Mes Notes', icon: GraduationCap }, // Student Grades
    { href: '/dashboard/attendance', label: 'Mes Présences', icon: ClipboardCheck }, // Student Absences Log
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/stages', label: 'Stages', icon: Briefcase }, // Browse Internship Posts
    { href: '/dashboard/complaints', label: 'Réclamations', icon: AlertTriangle }, // Grade Appeals
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  PARTNER: [
    { href: '/dashboard/partner', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/stages', label: 'Mes Offres', icon: Briefcase }, // Manage Posted Offers
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  CHEF_DEPT: [
    { href: '/dashboard/chef', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/chef/teachers', label: 'Mes Enseignants', icon: Users }, // Dept Teachers list
    { href: '/dashboard/chef/students', label: 'Mes Étudiants', icon: Users }, // Dept Students list
    { href: '/dashboard/chef/courses', label: 'Cours et Matières', icon: BookOpen }, // Dept Courses list
    { href: '/dashboard/chef/schedule', label: 'Emploi du temps', icon: CalendarDays }, // Timetable Management
    { href: '/dashboard/chef/rooms', label: 'Salles', icon: MapPin }, // Manage Classrooms
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/stages', label: 'Stages', icon: Briefcase },
    { href: '/dashboard/complaints', label: 'Réclamations', icon: AlertTriangle }, // Resolve Appeals
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
};

// Colors mapping: unique color gradient classes for the branding icon background by role
const roleGradients = {
  ADMIN: 'from-violet-600 to-indigo-700',
  TEACHER: 'from-blue-600 to-cyan-700',
  STUDENT: 'from-emerald-600 to-teal-700',
  PARTNER: 'from-amber-600 to-orange-700',
  CHEF_DEPT: 'from-indigo-600 to-blue-700',
};

// Sidebar React Component
export default function Sidebar() {
  // Extract user details and log out trigger from authentication context
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // State for toggling desktop sidebar folding
  const [collapsed, setCollapsed] = useState(false);
  // State for toggling mobile drawer panel
  const [mobileOpen, setMobileOpen] = useState(false);

  // Retrieve matching navigation menu items based on the user's role, default to STUDENT view if none
  const items = navItems[user?.role] || navItems.STUDENT;

  // Effect hook to dynamically update document CSS variables when collapsed state changes
  // This lets the main content margin adjust smoothly
  useEffect(() => {
    const root = document.documentElement;
    if (collapsed) {
      root.style.setProperty('--sidebar-current-width', 'var(--sidebar-collapsed-width)');
    } else {
      root.style.setProperty('--sidebar-current-width', 'var(--sidebar-width)');
    }
  }, [collapsed]);

  // Log user out of the application session and redirect them to login page
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Reusable sub-component to render the inside content of the sidebar (used in both desktop/mobile view)
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Brand Header Section */}
      <div className={cn("p-5 pb-4", collapsed && !isMobile && "px-3 flex justify-center")}>
        <div className={cn("flex items-center gap-3", collapsed && !isMobile && "justify-center")}>
          {/* Logo icon with role-specific gradient background */}
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0",
            collapsed && !isMobile ? "w-9 h-9" : "w-10 h-10",
            roleGradients[user?.role] || roleGradients.STUDENT
          )}>
            <Building2 className="text-white" size={collapsed && !isMobile ? 16 : 18} />
          </div>
          {/* Brand Titles: Hidden if sidebar is folded and it's not a mobile drawer */}
          {(!collapsed || isMobile) && (
            <div className="animate-fade-in">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px] leading-tight tracking-tight">ISET Gafsa</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">Portail Universitaire</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu Links */}
      <nav className={cn(
        "flex-1 space-y-0.5 overflow-y-auto",
        collapsed && !isMobile ? "px-2" : "px-3"
      )}>
        {/* Title/Label for menu section */}
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 px-3 pb-2 pt-1">Menu</p>
        )}
        {/* Map through navigation array list to generate Links */}
        {items.map((item) => {
          // Check if active URL route path matches this navigation link
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)} // Close mobile panel on click
              className={cn(
                "flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                collapsed && !isMobile
                  ? "justify-center w-10 h-10 mx-auto p-0"
                  : "gap-3 px-3 py-2.5"
              )}
              title={collapsed && !isMobile ? item.label : undefined} // Tooltip title when collapsed
            >
              <Icon size={collapsed && !isMobile ? 18 : 17} className="shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Action Button */}
      <div className={cn("p-3 mt-auto", collapsed && !isMobile && "px-2")}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 w-full text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400",
            collapsed && !isMobile
              ? "justify-center w-10 h-10 mx-auto p-0"
              : "gap-3 px-3 py-2.5"
          )}
          title={collapsed && !isMobile ? "Déconnexion" : undefined} // Tooltip when collapsed
        >
          <LogOut size={collapsed && !isMobile ? 18 : 17} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse/Fold toggle button at the bottom of the sidebar (Desktop view only) */}
      {!isMobile && (
        <div className="px-3 pb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-all"
            )}
          >
            {/* Arrow icon rotates 180 degrees when collapsed */}
            <ChevronLeft size={16} className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger (Hidden on screen size large and above) */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="fixed top-3 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 hover:shadow-md transition-all"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>
          {/* Slide-out drawer contents */}
          <SheetContent side="left" className="p-0 w-[var(--sidebar-width)] border-r-0">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar Panel (Hidden on screens below large) */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-40 transition-all duration-300 flex-col",
          collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
