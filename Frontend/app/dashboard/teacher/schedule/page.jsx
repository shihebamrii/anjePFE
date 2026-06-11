// Instruct the browser/Next.js to run this component on the client side (in the user's browser)
'use client';

// Import React hooks for managing state, side-effects, and memoizing variables
import { useState, useEffect, useMemo } from 'react';
// Import UI Card components to lay out clean boxes for fallback display messages
import { Card, CardContent } from '@/components/ui/card';
// Import loading spinner UI component
import { LoadingSpinner } from '@/components/ui/loading';
// Import the service module to communicate with academic database API routes
import { academicService } from '@/services/academicService';
// Import Lucide icons for calendar, classroom pins, and student group users
import { CalendarDays, MapPin, Users as UsersIcon } from 'lucide-react';

// Array representing names of the days of the week (Monday to Saturday)
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
// Define the standard class periods/time slots representing each row of our schedule table
const TIME_SLOTS = [
  { id: 1, label: '08:30 - 10:00' },
  { id: 2, label: '10:10 - 11:40' },
  { id: 3, label: '11:50 - 13:20' },
  { id: 4, label: '14:00 - 15:30' },
  { id: 5, label: '15:40 - 17:10' },
  { id: 6, label: '17:20 - 18:50' },
];

// Define and export the main page component for the teacher's schedule view
export default function TeacherSchedulePage() {
  // State to store the full array of class sessions retrieved from the backend
  const [sessions, setSessions] = useState([]);
  // State to track if the schedule data is currently being fetched
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Fetch the schedule of the current teacher upon component mounting
  useEffect(() => {
    async function fetchSchedule() {
      setLoadingSchedule(true);
      try {
        // Query academic API for the list of class sessions associated with this teacher's account
        const data = await academicService.getTeacherSchedule();
        // Set the sessions list in state, falling back to an empty list if data is invalid or falsy
        setSessions(data || []);
      } catch (err) { 
        // Log schedule-loading API errors to the console
        console.error("Failed to load teacher schedule:", err); 
      } finally { 
        // Stop the loading spinner once the query finishes
        setLoadingSchedule(false); 
      }
    }
    fetchSchedule();
  }, []); // Run exactly once when page initially mounts

  // Map the flat sessions array into a day/slot grid matrix [dayOfWeek][timeSlot].
  // This memoized function avoids rebuilding the grid unless the sessions data array changes.
  const scheduleMatrix = useMemo(() => {
    const matrix = {};
    // Initialize the empty matrix grid object: days 1 to 6, time slots 1 to 6
    for (let d = 1; d <= 6; d++) {
      matrix[d] = {};
      for (let s = 1; s <= 6; s++) {
        // Every grid coordinate points to an array (because multiple subgroups/sessions can theoretically overlap)
        matrix[d][s] = []; 
      }
    }
    // Populate the matrix with active class sessions
    sessions.forEach(session => {
       // Validate that the session dayOfWeek and timeSlot fall within bounds of our schedule matrix
       if (matrix[session.dayOfWeek] && matrix[session.dayOfWeek][session.timeSlot]) {
          // Add the session object into the target day/time slot array cell
          matrix[session.dayOfWeek][session.timeSlot].push(session);
       }
    });
    return matrix;
  }, [sessions]);

  return (
    <div className="space-y-6">
      {/* Header section with page title and description */}
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

      {/* Conditional rendering based on schedule loading state */}
      {loadingSchedule ? (
         // Styled loading panel showing custom message with spinner
         <div className="flex justify-center items-center h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex flex-col items-center gap-3">
                 <LoadingSpinner size={32} className="text-blue-500" />
                 <span className="text-sm font-medium text-slate-500">Chargement de votre planning...</span>
             </div>
         </div>
      ) : sessions.length === 0 ? (
         // Fallback card shown if the teacher has no assigned classes in the schedule database
         <Card className="border-0 shadow-sm bg-slate-50/50">
           <CardContent className="flex flex-col items-center justify-center py-24 text-center">
             <CalendarDays size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-500 font-medium">L'administration n'a pas encore publié de séances à votre nom.</p>
           </CardContent>
         </Card>
      ) : (
        // Responsive schedule table wrapper
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto p-4 custom-scrollbar">
          <div className="min-w-[1000px]">
             {/* Grid header row containing names of the week days */}
             <div className="grid grid-cols-7 gap-2 mb-2">
                <div className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-xl">Horaire / Jour</div>
                {DAYS.map(day => (
                   <div key={day} className="p-3 text-center text-sm font-extrabold text-slate-700 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                      {day}
                   </div>
                ))}
             </div>

             {/* Grid Body containing time-slot rows */}
             <div className="space-y-2">
                {TIME_SLOTS.map(slot => (
                   <div key={slot.id} className="grid grid-cols-7 gap-2">
                      {/* Time slot indicator block on the far left column */}
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-500">
                         <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[0]}</span>
                         <span className="text-xs font-bold opacity-60">à</span>
                         <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[1]}</span>
                      </div>

                      {/* Map through each day cell in the row */}
                      {DAYS.map((_, dayIndex) => {
                         const dayId = dayIndex + 1; // Translate loop index 0-5 to day indexes 1-6
                         // Extract sessions scheduled at this day/time slot coordinates
                         const cellSessions = scheduleMatrix[dayId]?.[slot.id] || [];
                         
                         return (
                            <div key={dayId} className={`min-h-[120px] rounded-xl border border-slate-100 p-1.5 ${cellSessions.length === 0 ? 'bg-slate-50/50' : 'bg-white shadow-sm'}`}>
                               {/* If cell has no sessions, render a clean placeholder dash */}
                               {cellSessions.length === 0 ? (
                                  <div className="h-full w-full flex items-center justify-center opacity-30">
                                     <span className="text-black/10 font-black text-2xl tracking-tighter">-</span>
                                  </div>
                               ) : (
                                  // Render list of session details within the grid cell
                                  <div className="space-y-1.5 h-full flex flex-col justify-center">
                                     {cellSessions.map((session, idx) => (
                                        // Session container styled depending on lesson type
                                        <div key={idx} className={`rounded-lg p-2.5 border-l-4 ${getTypeColors(session.type)} relative group hover:-translate-y-0.5 transition-transform`}>
                                            {/* Course Title */}
                                            <div className="flex items-start justify-between gap-1 mb-1.5 flex-col">
                                               <h4 className="text-[11px] font-extrabold tracking-tight leading-snug line-clamp-2">
                                                  {session.course?.name || session.courseName || 'Module inattendu'}
                                               </h4>
                                            </div>
                                            
                                            {/* Class and Room information details */}
                                            <div className="space-y-1">
                                               {/* Class Name */}
                                               <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                                                  <UsersIcon size={10} />
                                                  <span className="truncate">{session.className || 'Classe inconnue'}</span>
                                               </div>
                                               {/* Classroom Room location */}
                                               <div className="flex items-center justify-between text-[10px] font-bold opacity-80">
                                                  <div className="flex items-center gap-1.5 truncate">
                                                    <MapPin size={10} />
                                                    <span className="truncate">{session.room?.name || 'Salle inconnue'}</span>
                                                  </div>
                                                  {/* Type and Group acronym Badge (TP, TD, CR) */}
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

// Visual CSS classes helper function to color-code grid cards according to lesson type (TP / TD / Lecture)
function getTypeColors(type) {
  switch (type) {
    case 'LECTURE': // Normal course lecture (blue)
      return 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-300';
    case 'TUTORIAL': // Guided exercise session (emerald)
      return 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-300';
    case 'PRACTICAL': // Lab practical session (amber)
      return 'bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-300';
    default: // Fallback coloring (slate)
      return 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-800 dark:text-slate-300';
  }
}
