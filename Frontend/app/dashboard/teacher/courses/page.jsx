// Instruct the browser/Next.js to run this component on the client side (in the user's browser)
'use client';

// Import React hooks for managing state, side-effects, and memoizing variables
import { useState, useEffect, useMemo } from 'react';
// Import UI Card components to lay out clean boxes for course objects
import { Card, CardContent } from '@/components/ui/card';
// Import UI Badge components to show small stylized metadata chips
import { Badge } from '@/components/ui/badge';
// Import UI Input component to handle the user search field
import { Input } from '@/components/ui/input';
// Import a pre-styled loading spinner component to display during API fetch
import { LoadingPage } from '@/components/ui/loading';
// Import the service module to communicate with academic database API routes
import { academicService } from '@/services/academicService';
// Import Lucide icons for courses, searching, location pins, calendars, and groups
import { BookOpen, Search, MapPin, CalendarDays, Users } from 'lucide-react';

// Array representing names of the days of the week, starting with an empty slot for index 0
const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
// Array mapping class time slot indices to their start times
const TIME_LABELS = ['', '08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];

// CSS style classes dictionary mapping session types to their respective background/border colors
const TYPE_COLORS = {
  LECTURE: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  TUTORIAL: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  PRACTICAL: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};
// Friendly labels matching database type names (French equivalents)
const TYPE_LABELS = { LECTURE: 'Cours', TUTORIAL: 'TD', PRACTICAL: 'TP' };

// Define and export the page component for viewing the teacher's courses
export default function TeacherCoursesPage() {
  // State to hold the full list of courses assigned to this teacher
  const [courses, setCourses] = useState([]);
  // State to track whether the API data is still loading
  const [loading, setLoading] = useState(true);
  // State to hold the current search text entered by the user
  const [search, setSearch] = useState('');
  // State to hold the selected course type filter (e.g. LECTURE, TUTORIAL, PRACTICAL, or empty for all)
  const [typeFilter, setTypeFilter] = useState('');

  // Fetch the list of courses taught by the teacher when the page first loads
  useEffect(() => {
    async function fetchData() {
      try {
        // Query the academic API for courses taught by the current teacher
        const data = await academicService.getTeacherCourses();
        // Save the results to component state
        setCourses(data);
      } catch (err) {
        // Log API failures to the browser console
        console.error(err);
      } finally {
        // Turn off the loading page screen since database request has completed
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Empty dependency array ensures this effect runs exactly once when page loads

  // Extract unique course types present in the course list to generate the category filters dynamically
  const types = useMemo(() => {
    // Generate a Set containing unique values of course.type
    const typeSet = new Set(courses.map(c => c.type));
    // Prepend an empty string for the "Tous" (All) button, and sort other values alphabetically
    return ['', ...Array.from(typeSet).sort()];
  }, [courses]);

  // Filter the course list dynamically depending on user search query and selected type filter
  const filtered = useMemo(() => {
    return courses.filter(c => {
      // Check if course name or class name matches search keywords
      const matchSearch = `${c.courseName} ${c.className}`.toLowerCase().includes(search.toLowerCase());
      // Check if course type matches selected filter (or if filter is empty, meaning all types match)
      const matchType = !typeFilter || c.type === typeFilter;
      // Both criteria must be satisfied
      return matchSearch && matchType;
    });
  }, [courses, search, typeFilter]);

  // Render a standard full-page loading spinner if data has not yet returned from API
  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Title section detailing page headers and total count of courses */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <BookOpen size={24} className="text-accent" /> Mes Cours
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Vos matières assignées — <span className="font-semibold text-slate-700 dark:text-slate-300">{courses.length}</span> cours au total
        </p>
      </div>

      {/* Filter and Search controls wrapper */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input 
            placeholder="Rechercher par cours, classe..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>
        
        {/* Category Filter Buttons */}
        <div className="flex gap-2">
          {types.map(type => (
            <button 
              key={type} 
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === type 
                  ? 'bg-accent text-white shadow-md shadow-accent/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {/* If type is empty string, render 'Tous' (All), otherwise show friendly display label */}
              {type ? (TYPE_LABELS[type] || type) : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid rendering the list of filtered course cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <Card key={i} className="border-0 card-interactive group overflow-hidden">
            {/* Horizontal decorative color strip at the top, customized by class type */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${course.type === 'PRACTICAL' ? 'from-amber-400 to-orange-500' : course.type === 'TUTORIAL' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-indigo-500'}`} />
            
            <CardContent className="p-5">
              {/* Header inside the course card containing name and type badge */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">{course.courseName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-[10px] uppercase font-bold ${TYPE_COLORS[course.type] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {TYPE_LABELS[course.type] || course.type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Body inside the course card containing class title and list of weekly schedule slots */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                  <Users size={14} className="text-slate-400 shrink-0" />
                  <span>{course.className}</span>
                </div>

                {/* List of specific schedule calendar slots allocated for this course */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {course.slots?.map((slot, j) => (
                    <div key={j} className="bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {/* Day and time representation */}
                      <span className="text-accent">{DAYS[slot.dayOfWeek]}</span> {TIME_LABELS[slot.timeSlot]}
                      {/* Optional classroom number details */}
                      {slot.room && <span className="ml-1 text-slate-400">• {slot.room}</span>}
                      {/* Optional student sub-group details */}
                      {slot.group && <span className="ml-1 text-violet-500">({slot.group})</span>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Render a fallback message if search filters out all courses */}
      {filtered.length === 0 && (
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucun cours trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
