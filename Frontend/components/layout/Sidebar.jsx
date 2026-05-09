'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, GraduationCap, ClipboardCheck, Newspaper,
  Calendar, Briefcase, Users, User, LogOut, Menu,
  ChevronLeft, Building2, BookOpen, School, MapPin, CalendarDays, MessageSquare, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = {
  ADMIN: [
    { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/admin/departments', label: 'Départements', icon: Building2 },
    { href: '/dashboard/admin/chefs', label: 'Chefs de Dép.', icon: Users },
    { href: '/dashboard/admin/teachers', label: 'Enseignants', icon: GraduationCap },
    { href: '/dashboard/admin/students', label: 'Étudiants', icon: Users },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/stages', label: 'Stages', icon: Briefcase },
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  TEACHER: [
    { href: '/dashboard/teacher', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/teacher/schedule', label: 'Mon Emploi', icon: CalendarDays },
    { href: '/dashboard/teacher/courses', label: 'Mes Cours', icon: BookOpen },

    { href: '/dashboard/grades', label: 'Notes', icon: GraduationCap },
    { href: '/dashboard/attendance', label: 'Présences', icon: ClipboardCheck },
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  STUDENT: [
    { href: '/dashboard/student', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/student/schedule', label: 'Mon Emploi', icon: CalendarDays },
    { href: '/dashboard/grades', label: 'Mes Notes', icon: GraduationCap },
    { href: '/dashboard/attendance', label: 'Mes Présences', icon: ClipboardCheck },
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/stages', label: 'Stages', icon: Briefcase },
    { href: '/dashboard/complaints', label: 'Réclamations', icon: AlertTriangle },
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  PARTNER: [
    { href: '/dashboard/partner', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/stages', label: 'Mes Offres', icon: Briefcase },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  CHEF_DEPT: [
    { href: '/dashboard/chef', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/chef/teachers', label: 'Mes Enseignants', icon: Users },

    { href: '/dashboard/chef/students', label: 'Mes Étudiants', icon: Users },
    { href: '/dashboard/chef/courses', label: 'Cours et Matières', icon: BookOpen },
    { href: '/dashboard/chef/schedule', label: 'Emploi du temps', icon: CalendarDays },
    { href: '/dashboard/chef/rooms', label: 'Salles', icon: MapPin },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/stages', label: 'Stages', icon: Briefcase },
    { href: '/dashboard/complaints', label: 'Réclamations', icon: AlertTriangle },
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
};

const roleGradients = {
  ADMIN: 'from-violet-600 to-indigo-700',
  TEACHER: 'from-blue-600 to-cyan-700',
  STUDENT: 'from-emerald-600 to-teal-700',
  PARTNER: 'from-amber-600 to-orange-700',
  CHEF_DEPT: 'from-indigo-600 to-blue-700',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems[user?.role] || navItems.STUDENT;

  // Sync collapsed state to CSS variable so the dashboard layout margin reacts
  useEffect(() => {
    const root = document.documentElement;
    if (collapsed) {
      root.style.setProperty('--sidebar-current-width', 'var(--sidebar-collapsed-width)');
    } else {
      root.style.setProperty('--sidebar-current-width', 'var(--sidebar-width)');
    }
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("p-5 pb-4", collapsed && !isMobile && "px-3 flex justify-center")}>
        <div className={cn("flex items-center gap-3", collapsed && !isMobile && "justify-center")}>
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0",
            collapsed && !isMobile ? "w-9 h-9" : "w-10 h-10",
            roleGradients[user?.role] || roleGradients.STUDENT
          )}>
            <Building2 className="text-white" size={collapsed && !isMobile ? 16 : 18} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="animate-fade-in">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px] leading-tight tracking-tight">ISET Gafsa</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">Portail Universitaire</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-0.5 overflow-y-auto",
        collapsed && !isMobile ? "px-2" : "px-3"
      )}>
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 px-3 pb-2 pt-1">Menu</p>
        )}
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                collapsed && !isMobile
                  ? "justify-center w-10 h-10 mx-auto p-0"
                  : "gap-3 px-3 py-2.5"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon size={collapsed && !isMobile ? 18 : 17} className="shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={cn("p-3 mt-auto", collapsed && !isMobile && "px-2")}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 w-full text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400",
            collapsed && !isMobile
              ? "justify-center w-10 h-10 mx-auto p-0"
              : "gap-3 px-3 py-2.5"
          )}
          title={collapsed && !isMobile ? "Déconnexion" : undefined}
        >
          <LogOut size={collapsed && !isMobile ? 18 : 17} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <div className="px-3 pb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-all"
            )}
          >
            <ChevronLeft size={16} className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="fixed top-3 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 hover:shadow-md transition-all"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[var(--sidebar-width)] border-r-0">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar panel */}
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
