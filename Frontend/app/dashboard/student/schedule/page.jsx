'use client'; // Tells Next.js to compile and execute this file as a client-side component (runs in the browser)

import { useState, useEffect, useMemo } from 'react'; // React hooks for managing state parameters, side effects, and caching calculated values
import { Card, CardContent } from '@/components/ui/card'; // custom UI components for card layouts
import { LoadingSpinner } from '@/components/ui/loading'; // custom UI loading spinner animations component
import { academicService } from '@/services/academicService'; // Helper functions to fetch student schedules
import { CalendarDays, MapPin, User as UserIcon } from 'lucide-react'; // Vector icons assets

// Days of the week header labels array for schedule columns
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Time slot intervals mapping definitions for schedule rows
const TIME_SLOTS = [
  { id: 1, label: '08:30 - 10:00' },
  { id: 2, label: '10:10 - 11:40' },
  { id: 3, label: '11:50 - 13:20' },
  { id: 4, label: '14:00 - 15:30' },
  { id: 5, label: '15:40 - 17:10' },
  { id: 6, label: '17:20 - 18:50' },
];

export default function StudentSchedulePage() {
  // --- React State Declarations ---
  const [sessions, setSessions] = useState([]); // List of scheduled class sessions fetched from the server
  const [loadingSchedule, setLoadingSchedule] = useState(true); // Loading spinner toggle flag

  // Fetch student schedule records automatically using authorization token payload identifiers on mount
  useEffect(() => {
    async function fetchSchedule() {
      setLoadingSchedule(true);
      try {
        const data = await academicService.getStudentSchedule(); // Query schedule database records
        setSessions(data || []);
      } catch (err) { 
        console.error("Failed to load student schedule:", err); 
      } finally { 
        setLoadingSchedule(false); // Stop loading indicator spinner
      }
    }
    fetchSchedule();
  }, []); // Run once on component load

  // Maps flat schedule sessions array to a coordinate grid lookup dictionary [dayOfWeek][timeSlot]
  const scheduleMatrix = useMemo(() => {
    const matrix = {};
    // Populate structure with empty coordinate list objects
    for (let d = 1; d <= 6; d++) {
      matrix[d] = {};
      for (let s = 1; s <= 6; s++) {
        matrix[d][s] = []; // Array handles multiple subgroup overlaps in identical time slots
      }
    }
    // Distribute sessions into coordinates
    sessions.forEach(session => {
       if (matrix[session.dayOfWeek] && matrix[session.dayOfWeek][session.timeSlot]) {
          matrix[session.dayOfWeek][session.timeSlot].push(session);
       }
    });
    return matrix;
  }, [sessions]); // Re-calculate only when sessions list shifts

  return (
    <div className="space-y-6">
      {/* Header section containing Page Title and descriptions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <CalendarDays size={24} className="text-accent" /> Mon Emploi du Temps
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Consultez votre emploi du temps hebdomadaire officiel
          </p>
        </div>
      </div>

      {loadingSchedule ? (
         // Show loader panel spinner
         <div className="flex justify-center items-center h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex flex-col items-center gap-3">
                 <LoadingSpinner size={32} className="text-emerald-500" />
                 <span className="text-sm font-medium text-slate-500">Chargement de votre planning...</span>
             </div>
         </div>
      ) : sessions.length === 0 ? (
         // Show empty placeholder banner alert if class schedule is unpublished
         <Card className="border-0 shadow-sm bg-slate-50/50">
           <CardContent className="flex flex-col items-center justify-center py-24 text-center">
             <CalendarDays size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-500 font-medium">L'administration n'a pas encore publié d'emploi du temps pour votre classe.</p>
           </CardContent>
         </Card>
      ) : (
        // Grid Table representation layout
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto p-4 custom-scrollbar">
          <div className="min-w-[1000px]">
             {/* Grid Days Header Column labels */}
             <div className="grid grid-cols-7 gap-2 mb-2">
                <div className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-xl">Horaire / Jour</div>
                {DAYS.map(day => (
                   <div key={day} className="p-3 text-center text-sm font-extrabold text-slate-700 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                      {day}
                   </div>
                ))}
             </div>

             {/* Grid Time Slots Body rows */}
             <div className="space-y-2">
                {TIME_SLOTS.map(slot => (
                   <div key={slot.id} className="grid grid-cols-7 gap-2">
                      {/* Time Slot interval label cell */}
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-500">
                         <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[0]}</span>
                         <span className="text-xs font-bold opacity-60">à</span>
                         <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[1]}</span>
                      </div>

                      {/* Days cells containing session card details blocks */}
                      {DAYS.map((_, dayIndex) => {
                         const dayId = dayIndex + 1; // Map index (0-5) to day numeric (1-6)
                         const cellSessions = scheduleMatrix[dayId]?.[slot.id] || [];
                         
                         return (
                            <div key={dayId} className={`min-h-[120px] rounded-xl border border-slate-100 p-1.5 ${cellSessions.length === 0 ? 'bg-slate-50/50' : 'bg-white shadow-sm'}`}>
                               {cellSessions.length === 0 ? (
                                  // Empty cell block indicator text
                                  <div className="h-full w-full flex items-center justify-center opacity-30">
                                     <span className="text-black/10 font-black text-2xl tracking-tighter">-</span>
                                  </div>
                               ) : (
                                  // Scheduled session cards loop elements
                                  <div className="space-y-1.5 h-full flex flex-col justify-center">
                                     {cellSessions.map((session, idx) => (
                                        <div key={idx} className={`rounded-lg p-2.5 border-l-4 ${getTypeColors(session.type)} relative group hover:-translate-y-0.5 transition-transform`}>
                                            {/* Subject / Course Title */}
                                            <div className="flex items-start justify-between gap-1 mb-1.5 flex-col">
                                               <h4 className="text-[11px] font-extrabold tracking-tight leading-snug line-clamp-2">
                                                  {session.course?.name || session.courseName || 'Module inattendu'}
                                               </h4>
                                            </div>
                                            
                                            {/* Details sidebar displaying instructor and classroom info */}
                                            <div className="space-y-1">
                                               {/* Instructor name */}
                                               <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                                                  <UserIcon size={10} />
                                                  <span className="truncate">{session.teacher?.name || 'Non assigné'}</span>
                                               </div>
                                               {/* Room location details */}
                                               <div className="flex items-center justify-between text-[10px] font-bold opacity-80">
                                                  <div className="flex items-center gap-1.5 truncate">
                                                    <MapPin size={10} />
                                                    <span className="truncate">{session.room?.name || 'Salle inconnue'}</span>
                                                  </div>
                                                  {/* Type and group tags badges */}
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

// Visual helpers to return Tailwind-based style classes depending on Session type (Lecture, TD, TP)
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
