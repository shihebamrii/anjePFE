import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getInitials(firstName, lastName) {
  if (!firstName && !lastName) return '??';
  const f = firstName ? firstName.charAt(0) : '';
  const l = lastName ? lastName.charAt(0) : '';
  return (f + l).toUpperCase();
}

/**
 * Calculates the weighted average of grades
 * @param {Array} grades - Array of grade objects {score: number, coefficient: number}
 * @returns {string} - Average formatted to 2 decimal places
 */
export function calculateAverage(grades) {
  if (!grades || grades.length === 0) return "0.00";
  
  let totalPoints = 0;
  let totalCoeff = 0;
  
  grades.forEach(g => {
    const score = Number(g.score) || 0;
    const coeff = Number(g.coefficient) || 1;
    totalPoints += score * coeff;
    totalCoeff += coeff;
  });
  
  if (totalCoeff === 0) return "0.00";
  return (totalPoints / totalCoeff).toFixed(2);
}

/**
 * Calculates attendance rate percentage
 * @param {Array} attendance - Array of attendance objects {status: 'PRESENT' | 'ABSENT' | 'LATE'}
 * @returns {number} - Attendance rate 0-100
 */
export function getAttendanceRate(attendance) {
  if (!attendance || attendance.length === 0) return 0;
  const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  return Math.round((present / attendance.length) * 100);
}

/**
 * Formats date string to French format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Returns Tailwind classes for grade color based on score
 * @param {number} score - Grade score
 * @returns {string} - CSS classes
 */
export function getGradeColor(score) {
  if (score >= 16) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400';
  if (score >= 12) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400';
  if (score >= 10) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400';
}

/**
 * Returns label and CSS class for user roles
 * @param {string} role - User role
 * @returns {object} - {label, class}
 */
export function getRoleBadge(role) {
  switch (role) {
    case 'ADMIN': return { label: 'Administrateur', class: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' };
    case 'TEACHER': return { label: 'Enseignant', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' };
    case 'STUDENT': return { label: 'Étudiant', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' };
    case 'PARTNER': return { label: 'Partenaire', class: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' };
    default: return { label: role || 'Inconnu', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30' };
  }
}

/**
 * Returns label and CSS class for stage types
 * @param {string} type - Stage type
 * @returns {object} - {label, class}
 */
export function getStageTypeBadge(type) {
  switch (type) {
    case 'PFE': return { label: 'PFE', class: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/30' };
    case 'OUVRIER': return { label: 'Ouvrier', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' };
    case 'PERFECTIONNEMENT': return { label: 'Perfectionnement', class: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30' };
    case 'SUMMER': return { label: 'Été', class: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' };
    default: return { label: type || 'Stage', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30' };
  }
}

/**
 * Returns label and CSS class for stage status
 * @param {string} status - Stage status
 * @returns {object} - {label, class}
 */
export function getStageStatusBadge(status) {
  switch (status) {
    case 'OPEN': return { label: 'Ouvert', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' };
    case 'CLOSED': return { label: 'Fermé', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30' };
    case 'PENDING': return { label: 'En attente', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' };
    default: return { label: status || 'Statut', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30' };
  }
}
