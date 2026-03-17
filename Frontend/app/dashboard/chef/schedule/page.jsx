'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { academicService } from '@/services/academicService';
import { departmentService } from '@/services/departmentService';
import { userService } from '@/services/userService';
import { CalendarDays, MapPin, User as UserIcon, BookOpen, ChevronDown, Plus, GripVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS = [
  { id: 1, label: '08:30 - 10:00' },
  { id: 2, label: '10:10 - 11:40' },
  { id: 3, label: '11:50 - 13:20' },
  { id: 4, label: '14:00 - 15:30' },
  { id: 5, label: '15:40 - 17:10' },
  { id: 6, label: '17:20 - 18:50' },
];

export default function SchedulePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [sessions, setSessions] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  const [draftCourse, setDraftCourse] = useState('');
  const [draftTeacher, setDraftTeacher] = useState('');
  const [draftRoom, setDraftRoom] = useState('');
  const [draftType, setDraftType] = useState('LECTURE');
  const [draftGroup, setDraftGroup] = useState('');

  // Load department classes and resources
  useEffect(() => {
    async function fetchData() {
      try {
        const [depts, coursesData, teachersData, roomsData] = await Promise.all([
          departmentService.getMyDepartment(),
          academicService.getMyCourses(),
          userService.getUsers('TEACHER'),
          academicService.getRooms()
        ]);

        if (depts && depts.length > 0) {
           const classList = depts[0].classes || [];
           setClasses(classList.sort((a,b) => a.name.localeCompare(b.name)));
           if (classList.length > 0) {
              setSelectedClass(classList[0]);
           }
        }
        setCourses(coursesData);
        setTeachers(teachersData);
        setRooms(roomsData);

      } catch (err) { console.error(err); }
      finally { setLoadingClasses(false); }
    }
    fetchData();
  }, []);

  // Load Schedule when class changes
  useEffect(() => {
    async function fetchSchedule() {
      if (!selectedClass) return;
      
      const targetId = selectedClass.externalId || selectedClass._id;
      if (!targetId) {
        setSessions([]);
        return;
      }
      
      setLoadingSchedule(true);
      try {
        const data = await academicService.getSchedule(targetId);
        setSessions(data);
      } catch (err) { 
        console.error(err);
        setSessions([]);
      }
      finally { setLoadingSchedule(false); }
    }
    fetchSchedule();
  }, [selectedClass]);

  // Helper to map sessions to the grid [day][slot]
  const scheduleMatrix = useMemo(() => {
    const matrix = {};
    for (let d = 1; d <= 6; d++) {
      matrix[d] = {};
      for (let s = 1; s <= 6; s++) {
        matrix[d][s] = []; 
      }
    }
    sessions.forEach(session => {
       if (matrix[session.dayOfWeek] && matrix[session.dayOfWeek][session.timeSlot]) {
          matrix[session.dayOfWeek][session.timeSlot].push(session);
       }
    });
    return matrix;
  }, [sessions]);

  // --- Drag and Drop Handlers ---

  const handleDragStartDraft = (e) => {
    if (!draftCourse || !draftTeacher || !draftRoom) {
      e.preventDefault();
      alert("Veuillez sélectionner un cours, un enseignant et une salle pour le brouillon.");
      return;
    }
    
    const courseObj = courses.find(c => c._id === draftCourse);
    const teacherObj = teachers.find(t => t._id === draftTeacher);
    const roomObj = rooms.find(r => r._id === draftRoom);

    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'draft',
      course: courseObj._id,
      courseName: courseObj.name,
      teacher: { id: teacherObj._id, name: `${teacherObj.firstName} ${teacherObj.lastName}` },
      room: { id: roomObj._id, name: roomObj.name },
      sessionType: draftType,
      group: draftGroup
    }));
  };

  const handleDragStartExisting = (e, session) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'existing',
      sessionId: session._id
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // allow dropping
    e.currentTarget.classList.add('bg-indigo-50/50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-indigo-50/50');
  };

  const handleDrop = async (e, dayOfWeek, timeSlot) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-indigo-50/50');
    
    if (!selectedClass) {
      alert("Erreur: Aucune classe sélectionnée.");
      return;
    }

    try {
      const dataStr = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
      if (!dataStr) {
        alert("Erreur: Les données du glisser-déposer sont vides. Veuillez réessayer.");
        return;
      }
      const data = JSON.parse(dataStr);

      if (data.type === 'draft') {
        const payload = {
          course: data.course,
          courseName: data.courseName,
          teacher: data.teacher,
          room: data.room,
          classId: selectedClass.externalId || selectedClass._id,
          className: selectedClass.name,
          type: data.sessionType,
          dayOfWeek,
          timeSlot,
          semester: 1, 
          group: data.group
        };
        const newSession = await academicService.addSession(payload);
        setSessions(prev => [...prev, newSession]);
        
      } else if (data.type === 'existing') {
        const updatedSession = await academicService.updateSession(data.sessionId, { dayOfWeek, timeSlot });
        setSessions(prev => prev.map(s => s._id === data.sessionId ? updatedSession : s));
      }
    } catch (error) {
      console.error('Drop error:', error);
      alert('Erreur: ' + (error.response?.data?.message || error.message || 'Impossible de sauvegarder la session.'));
    }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cette session ?')) return;
    try {
      await academicService.deleteSession(id);
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch (error) {
      console.error('Delete error', error);
      alert('Erreur lors de la suppression.');
    }
  };


  if (loadingClasses) {
      return (
          <div className="flex justify-center items-center h-64">
             <LoadingSpinner size={32} className="text-accent" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <CalendarDays size={24} className="text-accent" /> Emploi du Temps
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Consultez et modifiez les plannings hebdomadaires des classes de votre département
          </p>
        </div>

        {/* Class Selector Dropdown */}
        <div className="w-full md:w-64">
           {classes.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-accent hover:text-accent transition-colors focus:outline-none">
                  {selectedClass ? selectedClass.name : 'Sélectionner une classe'}
                  <ChevronDown size={16} className="text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto rounded-xl shadow-xl border-slate-100 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 z-50">
                  {classes.map(cls => (
                    <DropdownMenuItem 
                       key={cls._id} 
                       onClick={() => setSelectedClass(cls)}
                       className={`rounded-lg cursor-pointer px-3 py-2 text-sm font-medium ${selectedClass?._id === cls._id ? 'bg-accent/10 text-accent font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {cls.name} <span className="text-slate-400 ml-auto font-normal text-xs">{cls.students} étud.</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
           ) : (
             <div className="text-sm text-slate-400 font-medium px-4 py-2 border rounded-xl bg-slate-50 hidden">Aucune classe</div>
           )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar for Drag Source */}
        <div className="w-full xl:w-[340px] shrink-0 space-y-4">
           <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-slate-900 overflow-hidden rounded-2xl relative">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent to-indigo-500"></div>
             <div className="bg-white dark:bg-slate-900 p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg tracking-tight">
                    <Plus size={20} className="text-accent" /> Nouvelle Session
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Configurez puis glissez dans la grille</p>
               </div>
             </div>
             <CardContent className="p-5 space-y-5">
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      Matière / Cours 
                      {draftCourse && <Badge variant="outline" className="h-5 text-[9px] border-emerald-200 text-emerald-600 bg-emerald-50">Sélectionné</Badge>}
                   </label>
                   <div className="relative">
                      <select 
                         className="w-full text-sm font-medium border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent p-3 border bg-slate-50/50 dark:bg-slate-800/50 dark:text-slate-200 appearance-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                         value={draftCourse} onChange={e => setDraftCourse(e.target.value)}
                      >
                        <option value="">Sélectionner un cours...</option>
                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      Enseignant
                      {draftTeacher && <Badge variant="outline" className="h-5 text-[9px] border-emerald-200 text-emerald-600 bg-emerald-50">Sélectionné</Badge>}
                   </label>
                   <div className="relative">
                      <select 
                         className="w-full text-sm font-medium border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent p-3 border bg-slate-50/50 dark:bg-slate-800/50 dark:text-slate-200 appearance-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                         value={draftTeacher} onChange={e => setDraftTeacher(e.target.value)}
                      >
                        <option value="">Sélectionner un enseignant...</option>
                        {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                      </select>
                      <UserIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      Salle
                      {draftRoom && <Badge variant="outline" className="h-5 text-[9px] border-emerald-200 text-emerald-600 bg-emerald-50">Sélectionné</Badge>}
                   </label>
                   <div className="relative">
                      <select 
                         className="w-full text-sm font-medium border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent p-3 border bg-slate-50/50 dark:bg-slate-800/50 dark:text-slate-200 appearance-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                         value={draftRoom} onChange={e => setDraftRoom(e.target.value)}
                      >
                        <option value="">Sélectionner une salle...</option>
                        {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.capacity} places)</option>)}
                      </select>
                      <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                     <div className="relative">
                        <select 
                           className="w-full text-sm font-medium border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent p-3 border bg-slate-50/50 dark:bg-slate-800/50 dark:text-slate-200 appearance-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                           value={draftType} onChange={e => setDraftType(e.target.value)}
                        >
                          <option value="LECTURE">Cours</option>
                          <option value="TUTORIAL">TD</option>
                          <option value="PRACTICAL">TP</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Groupe</label>
                     <div className="relative">
                        <input 
                           type="text" 
                           placeholder="Ex: Gr 1" 
                           className="w-full text-sm font-medium border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent p-3 border bg-slate-50/50 dark:bg-slate-800/50 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                           value={draftGroup} onChange={e => setDraftGroup(e.target.value)}
                        />
                     </div>
                   </div>
                </div>

                {draftCourse && draftTeacher && draftRoom ? (
                  <button 
                    type="button"
                    draggable="true"
                    onDragStart={handleDragStartDraft}
                    className={`w-full mt-6 text-left rounded-xl p-3 border-l-4 ${getTypeColors(draftType)} relative group cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-accent/20`}
                  >
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <GripVertical size={10} /> Glisser la carte
                     </div>
                     <div className="flex items-start justify-between gap-1 mb-2 pr-1 mt-1 pointer-events-none">
                        <h4 className="text-xs font-extrabold tracking-tight leading-snug line-clamp-2">
                           {courses.find(c => c._id === draftCourse)?.name}
                        </h4>
                     </div>
                     
                     <div className="space-y-1.5 pointer-events-none">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-80">
                           <UserIcon size={12} />
                           {(() => {
                              const t = teachers.find(t => t._id === draftTeacher);
                              return t ? `${t.firstName} ${t.lastName}` : '';
                           })()}
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                           <div className="flex items-center gap-1.5 truncate">
                             <MapPin size={12} />
                             <span className="truncate">{rooms.find(r => r._id === draftRoom)?.name}</span>
                           </div>
                           <span className="uppercase tracking-widest text-[9px] bg-white/60 px-1.5 py-0.5 rounded-md shadow-sm shrink-0 font-black">
                              {draftType === 'PRACTICAL' ? 'TP' : draftType === 'TUTORIAL' ? 'TD' : 'CR'} {draftGroup && `- ${draftGroup}`}
                           </span>
                        </div>
                     </div>
                  </button>
                ) : (
                  <div className="w-full mt-8 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-not-allowed opacity-60">
                     <GripVertical size={24} className="text-slate-400 mb-1.5" />
                     <span className="font-bold text-sm text-slate-400">Complétez les champs</span>
                  </div>
                )}
             </CardContent>
           </Card>
        </div>

        {/* Schedule Grid */}
        <div className="flex-1 min-w-0">
          {loadingSchedule ? (
             <div className="flex justify-center items-center h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                 <div className="flex flex-col items-center gap-3">
                     <LoadingSpinner size={32} className="text-indigo-500" />
                     <span className="text-sm font-medium text-slate-500">Chargement du planning...</span>
                 </div>
             </div>
          ) : !selectedClass ? (
             <Card className="border-0 shadow-sm bg-slate-50/50">
               <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                 <CalendarDays size={48} className="text-slate-200 mb-4" />
                 <p className="text-slate-500 font-medium">Sélectionnez une classe pour voir l'emploi du temps</p>
               </CardContent>
             </Card>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto p-4 custom-scrollbar">
              <div className="min-w-[900px]">
                 {/* Grid Header */}
                 <div className="grid grid-cols-7 gap-2 mb-2 w-full">
                    <div className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-xl">Horaire / Jour</div>
                    {DAYS.map(day => (
                       <div key={day} className="p-3 text-center text-sm font-extrabold text-slate-700 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                          {day}
                       </div>
                    ))}
                 </div>
    
                 {/* Grid Body */}
                 <div className="space-y-2 w-full">
                    {TIME_SLOTS.map(slot => (
                       <div key={slot.id} className="grid grid-cols-7 gap-2">
                          {/* Time Slot Header */}
                          <div className="flex flex-col items-center justify-center p-2 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-500">
                             <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[0]}</span>
                             <span className="text-xs font-bold opacity-60">à</span>
                             <span className="text-base font-extrabold text-slate-700 tracking-tight">{slot.label.split(' - ')[1]}</span>
                          </div>
    
                          {/* Day Cells (Drop Targets) */}
                          {DAYS.map((_, dayIndex) => {
                             const dayId = dayIndex + 1; // 1 to 6
                             const cellSessions = scheduleMatrix[dayId]?.[slot.id] || [];
                             
                             return (
                                <div 
                                  key={dayId} 
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, dayId, slot.id)}
                                  className={`min-h-[120px] rounded-xl border border-slate-100 p-1.5 transition-colors ${cellSessions.length === 0 ? 'bg-slate-50/50 hover:bg-slate-100/80' : 'bg-white shadow-sm'}`}
                                >
                                   {cellSessions.length === 0 ? (
                                      <div className="h-full w-full flex items-center justify-center pointer-events-none opacity-30">
                                         <span className="text-black/10 font-black text-2xl tracking-tighter">-</span>
                                      </div>
                                   ) : (
                                      <div className="space-y-1.5 h-full flex flex-col justify-center">
                                         {cellSessions.map((session, idx) => (
                                            <div 
                                              key={idx} 
                                              draggable
                                              onDragStart={(e) => handleDragStartExisting(e, session)}
                                              className={`rounded-lg p-2.5 border-l-4 ${getTypeColors(session.type)} relative group cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all shadow-sm`}
                                            >
                                                <button 
                                                   onClick={(e) => { e.stopPropagation(); handleDeleteSession(session._id); }}
                                                   className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-500 p-1 rounded hover:bg-red-50 z-10"
                                                >
                                                   <Trash2 size={12} />
                                                </button>

                                                {/* Course */}
                                                <div className="flex items-start justify-between gap-1 mb-1.5 pr-4 pointer-events-none">
                                                   <h4 className="text-[11px] font-extrabold tracking-tight leading-snug line-clamp-2">
                                                      {session.courseName}
                                                   </h4>
                                                </div>
                                                
                                                <div className="space-y-1 pointer-events-none">
                                                   {/* Teacher */}
                                                   <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                                                      <UserIcon size={10} />
                                                      <span className="truncate">{session.teacher?.name}</span>
                                                   </div>
                                                   {/* Room */}
                                                   <div className="flex items-center justify-between text-[10px] font-bold opacity-80">
                                                      <div className="flex items-center gap-1.5 truncate">
                                                        <MapPin size={10} />
                                                        <span className="truncate">{session.room?.name}</span>
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
      </div>
    </div>
  );
}

// Visual helpers based on Session Type
function getTypeColors(type) {
  switch (type) {
    case 'LECTURE':
      return 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-300';
    case 'TUTORIAL':
      return 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-900 dark:text-indigo-300';
    case 'PRACTICAL':
      return 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-300';
    default:
      return 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-800 dark:text-slate-300';
  }
}
