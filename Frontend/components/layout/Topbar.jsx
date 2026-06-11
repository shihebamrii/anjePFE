'use client';

// Import custom authentication hook
import { useAuth } from '@/context/AuthContext';
// Import Lucide icons for UI icons
import { Bell, Sun, Moon, LogOut, User, Check, Info, AlertTriangle } from 'lucide-react';
// Import React state and effect hooks
import { useState, useEffect } from 'react';
// Import client-side router utility from Next.js
import { useRouter } from 'next/navigation';
// Import avatar initials helper function
import { getInitials } from '@/lib/utils';
// Import axios to make API requests directly in the component
import axios from 'axios';
// Import dropdown menu components from Shadcn UI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper script to calculate elapsed time in French words (e.g. "il y a 5 minutes")
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `il y a ${Math.floor(interval)} an${Math.floor(interval) > 1 ? 's' : ''}`; // years
  interval = seconds / 2592000;
  if (interval > 1) return `il y a ${Math.floor(interval)} mois`; // months
  interval = seconds / 86400;
  if (interval > 1) return `il y a ${Math.floor(interval)} jour${Math.floor(interval) > 1 ? 's' : ''}`; // days
  interval = seconds / 3600;
  if (interval > 1) return `il y a ${Math.floor(interval)} heure${Math.floor(interval) > 1 ? 's' : ''}`; // hours
  interval = seconds / 60;
  if (interval > 1) return `il y a ${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''}`; // minutes
  return 'à l\'instant'; // just now
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  // State to track if dark mode is active
  const [darkMode, setDarkMode] = useState(false);
  // State containing fetched notifications
  const [notifications, setNotifications] = useState([]);

  // Read dark mode state on mount
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Fetch notifications list from backend and setup periodic refreshing
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Load read notifications IDs array cache from localStorage
        const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        
        // Format relative times and add read/unread flag based on cached IDs
        const formattedNotifs = res.data.map(notif => ({
          ...notif,
          timeFormatted: timeAgo(notif.time),
          unread: !readIds.includes(notif.id)
        }));
        
        setNotifications(formattedNotifs);
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications', error);
      }
    };

    // Trigger initial load
    fetchNotifications();
    
    // Setup interval to automatically update notifications list every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Toggle dark/light theme classes on root element
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  // Sign out and redirect
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mark a single notification item as read and store its ID in browser localStorage
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
    const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (!readIds.includes(id)) {
      localStorage.setItem('readNotifications', JSON.stringify([...readIds, id]));
    }
  };

  // Mark all notifications in list as read and store all IDs in localStorage
  const markAllAsRead = (e) => {
    e.stopPropagation(); // Prevent dropdown from closing prematurely
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('readNotifications', JSON.stringify(allIds));
  };

  // Calculate remaining unread count
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-6 flex items-center justify-between gap-4">
      {/* Greetings section showing logged-in user name and French formatted current date */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
            Bonjour, {user?.firstName} 👋
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Action triggers (Theme toggle, Notifications dropdown, User profile dropdown) */}
      <div className="flex items-center gap-1.5">
        {/* Dark Mode toggle trigger */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Dropdown Panel */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all outline-none cursor-pointer">
              <Bell size={17} />
              {/* Unread badge indicator dot */}
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-2">
            <DropdownMenuLabel className="font-normal flex justify-between items-center w-full pb-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.length > 0 ? notifications.map(notif => (
                <DropdownMenuItem 
                  key={notif.id} 
                  className={`flex flex-col items-start p-3 cursor-pointer transition-colors ${notif.unread ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''}`} 
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start justify-between w-full mb-1 gap-2">
                    <span className={`text-sm font-medium ${notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">{notif.timeFormatted || notif.time}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</span>
                </DropdownMenuItem>
              )) : (
                <div className="py-6 text-center text-sm text-slate-500">Aucune notification</div>
              )}
            </div>
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div 
                  className="p-2 text-center text-sm font-medium text-accent hover:text-accent/80 cursor-pointer transition-colors" 
                  onClick={markAllAsRead}
                >
                  Marquer tout comme lu
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

        {/* User Account Settings Dropdown Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none cursor-pointer">
            <div className="hidden sm:block text-right">
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{user?.email}</p>
            </div>
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-accent to-indigo-600 text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-900 transition-transform hover:scale-105">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Directs user to their profile settings tab */}
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Trigger handleLogout to clear session and redirect */}
            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

