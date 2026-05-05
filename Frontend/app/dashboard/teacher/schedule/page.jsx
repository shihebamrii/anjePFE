'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { academicService } from '@/services/academicService';
import { CalendarDays, MapPin, Users as UsersIcon } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS = [
  { id: 1, label: '08:30 - 10:00' },
  { id: 2, label: '10:10 - 11:40' },
  { id: 3, label: '11:50 - 13:20' },
  { id: 4, label: '14:00 - 15:30' },
  { id: 5, label: '15:40 - 17:10' },
  { id: 6, label: '17:20 - 18:50' },
];

export default function TeacherSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Load Schedule automatically from the teacher token binding
  useEffect(() => {
    async function fetchSchedule() {
      setLoadingSchedule(true);
      try {
        const data = await academicService.getTeacherSchedule();
        setSessions(data || []);
      } catch (err) { 
        console.error("Failed to load teacher schedule:", err); 
      } finally { 
        setLoadingSchedule(false); 
      }
    }
    fetchSchedule();
  }, []);

  // Helper to map sessions to the grid [day][slot]
  const scheduleMatrix = useMemo(() => {
    const matrix = {};
    // Initialize empty grid
    for (let d = 1; d <= 6; d++) {
      matrix[d] = {};
      for (let s = 1; s <= 6; s++) {
        matrix[d][s] = []; // Array because there can be multiple subgroups (Groupe 1/2) in same slot
      }
    }
    // Populate
    sessions.forEach(session => {
       if (matrix[session.dayOfWeek] && matrix[session.dayOfWeek][session.timeSlot]) {
          matrix[session.dayOfWeek][session.timeSlot].push(session);
       }
    });
    return matrix;
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <CalendarDays size={24} className="text-accent" /> Mon Emploi du Temps
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Consultez votre planning hebdomadaire en tant qu'enseignant
          </p>
        </div>
      </div>

      {loadingSchedule ? (
         <div className="flex justify-center items-center h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex flex-col items-center gap-3">
                 <LoadingSpinner size={32} className="text-blue-500" />
                 <span className="text-sm font-medium text-slate-500">Chargement de votre planning...</span>
             </div>
         </div>
      ) : sessions.length === 0 ? (
         <Card className="border-0 shadow-sm bg-slate-50/50">
           <CardContent className="flex flex-col items-center justify-center py-24 text-center">
             <CalendarDays size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-500 font-medium">L'administration n'a pas encore publié de séances à votre nom.</p>
           </CardContent>
         </Card>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto p-4 custom-scrollbar">
          <div className="min-w-[1000px]">
             {/* Grid Header */}
             <div className="grid grid-cols-7 gap-2 mb-2">
                <div className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-xl">Horaire / Jour</div>
                {DAYS.map(day => (
                   <div key={day} className="p-3 text-center text-sm font-extrabold text-slate-700 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                      {day}
                   </div>
                ))}
             </div>

             {/* Grid Body */}
             <div className="space-y-2">
                {TIME_SLOTS.map(slot => (
                   <div key={slot.id} className="grid grid-cols-7 gap-2">
                      {/* Time Slot Header */}
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-500">
                         <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[0]}</span>
                         <span className="text-xs font-bold opacity-60">à</span>
                         <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[1]}</span>
                      </div>

                      {/* Day Cells */}
                      {DAYS.map((_, dayIndex) => {
                         const dayId = dayIndex + 1; // 1 to 6
                         const cellSessions = scheduleMatrix[dayId]?.[slot.id] || [];
                         
                         return (
                            <div key={dayId} className={`min-h-[120px] rounded-xl border border-slate-100 p-1.5 ${cellSessions.length === 0 ? 'bg-slate-50/50' : 'bg-white shadow-sm'}`}>
                               {cellSessions.length === 0 ? (
                                  <div className="h-full w-full flex items-center justify-center opacity-30">
                                     <span className="text-black/10 font-black text-2xl tracking-tighter">-</span>
                                  </div>
                               ) : (
                                  <div className="space-y-1.5 h-full flex flex-col justify-center">
                                     {cellSessions.map((session, idx) => (
                                        <div key={idx} className={`rounded-lg p-2.5 border-l-4 ${getTypeColors(session.type)} relative group hover:-translate-y-0.5 transition-transform`}>
                                            {/* Course */}
                                            <div className="flex items-start justify-between gap-1 mb-1.5 flex-col">
                                               <h4 className="text-[11px] font-extrabold tracking-tight leading-snug line-clamp-2">
                                                  {session.course?.name || session.courseName || 'Module inattendu'}
                                               </h4>
                                            </div>
                                            
                                            <div className="space-y-1">
                                               {/* Class Target */}
                                               <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                                                  <UsersIcon size={10} />
                                                  <span className="truncate">{session.className || 'Classe inconnue'}</span>
                                               </div>
                                               {/* Room */}
                                               <div className="flex items-center justify-between text-[10px] font-bold opacity-80">
                                                  <div className="flex items-center gap-1.5 truncate">
                                                    <MapPin size={10} />
                                                    <span className="truncate">{session.room?.name || 'Salle inconnue'}</span>
                                                  </div>
                                                  {/* Type/Group Badge */}
                                                  <span className="uppercase tracking-widest text-[8px] bg-white/50 px-1.5 py-0.5 rounded shadow-sm shrink-0 font-black">
                                                     {session.type === 'PRACTICAL' ? 'TP' : session.type === 'TUTORIAL' ? 'TD' : 'CR'} {session.group && `- ${session.group}`}
                                                  </span>
                                               </div>
                                            </div>
                                        </div>
                                     ))}
                                  </div>
                               )}
                            </div>
                         );
                      })}
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Visual helpers based on Session Type
function getTypeColors(type) {
  switch (type) {
    case 'LECTURE':
      return 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-300';
    case 'TUTORIAL':
      return 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-300';
    case 'PRACTICAL':
      return 'bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-300';
    default:
      return 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-800 dark:text-slate-300';
  }
}
