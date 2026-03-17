'use client';

import { useAuth } from '@/context/AuthContext';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getInitials } from '@/lib/utils';

export default function Topbar() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-6 flex items-center justify-between gap-4">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 w-full max-w-sm border border-slate-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/40 transition-all">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{user?.email}</p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-accent to-indigo-600 text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-900">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
        </div>
      </div>
    </header>
  );
}
