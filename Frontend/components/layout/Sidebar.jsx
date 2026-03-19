'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, GraduationCap, ClipboardCheck, Newspaper,
  Calendar, Briefcase, Users, User, LogOut, Menu, X,
  ChevronLeft, Building2, BookOpen, School, MapPin, CalendarDays, MessageSquare, AlertTriangle
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = {
  ADMIN: [
    { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/grades', label: 'Notes', icon: GraduationCap },
    { href: '/dashboard/attendance', label: 'Présences', icon: ClipboardCheck },
    { href: '/dashboard/news', label: 'Actualités', icon: Newspaper },
    { href: '/dashboard/events', label: 'Événements', icon: Calendar },
    { href: '/dashboard/stages', label: 'Stages', icon: Briefcase },
    { href: '/dashboard/users', label: 'Utilisateurs', icon: Users },
    { href: '/dashboard/chat', label: 'Messagerie', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ],
  TEACHER: [
    { href: '/dashboard/teacher', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/dashboard/teacher/schedule', label: 'Mon Emploi', icon: CalendarDays },
    { href: '/dashboard/teacher/courses', label: 'Mes Cours', icon: BookOpen },
    { href: '/dashboard/teacher/classes', label: 'Mes Classes', icon: School },
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
    { href: '/dashboard/chef/classes', label: 'Mes Classes', icon: School },
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
  CHEF_DEPT: 'from-rose-600 to-pink-700',
};

const roleLabels = {
  ADMIN: 'Administrateur',
  TEACHER: 'Enseignant',
  STUDENT: 'Étudiant',
  PARTNER: 'Partenaire',
  CHEF_DEPT: 'Chef de Département',
};

const roleBg = {
  ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  TEACHER: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  STUDENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  PARTNER: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  CHEF_DEPT: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems[user?.role] || navItems.STUDENT;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br shadow-lg",
            roleGradients[user?.role] || roleGradients.STUDENT
          )}>
            <Building2 className="text-white" size={18} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px] leading-tight tracking-tight">ISET Gafsa</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">Portail Universitaire</p>
            </div>
          )}
        </div>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="mx-4 mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br text-white text-xs font-bold shadow-sm",
              roleGradients[user?.role] || roleGradients.STUDENT
            )}>
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <span className={cn("inline-block mt-0.5 px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider", roleBg[user?.role])}>
                {roleLabels[user?.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 px-3 pb-2 pt-1">Menu</p>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group",
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} className={cn(
                "shrink-0 transition-transform duration-200",
                !isActive && "group-hover:scale-110"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 w-full text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <div className="px-3 pb-4 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-all"
        >
          <ChevronLeft size={16} className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>
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
            <SidebarContent />
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
