'use client';

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className, size = 24 }) {
  return (
    <Loader2
      className={cn("animate-spin text-accent", className)}
      size={size}
    />
  );
}

export function LoadingPage({ message = "Chargement..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
        <LoadingSpinner size={36} />
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse-soft">
        {message}
      </p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 space-y-4 shadow-card">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-20 w-full" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
