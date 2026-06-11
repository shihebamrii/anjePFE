// Instruct the browser/Next.js to run this component on the client side (in the user's browser)
'use client';

// Import React hooks for managing state, side-effects, and memoizing search operations
import { useState, useEffect, useMemo } from 'react';
// Import UI Card components to lay out clean boxes for classes
import { Card, CardContent } from '@/components/ui/card';
// Import UI Badge component to display courses as badges
import { Badge } from '@/components/ui/badge';
// Import UI Input component to handle the user search field
import { Input } from '@/components/ui/input';
// Import a pre-styled loading spinner component to display during API fetch
import { LoadingPage } from '@/components/ui/loading';
// Import the service module to communicate with academic database API routes
import { academicService } from '@/services/academicService';
// Import Lucide icons for classes, searching, book items, and calendars
import { School, Search, BookOpen, CalendarDays } from 'lucide-react';

// Define and export the page component for viewing the teacher's classes
export default function TeacherClassesPage() {
  // State to hold the full list of classes assigned to the teacher
  const [classes, setClasses] = useState([]);
  // State to track whether the API data is still loading
  const [loading, setLoading] = useState(true);
  // State to hold the current search text entered by the user
  const [search, setSearch] = useState('');

  // Fetch the classes taught by the logged-in teacher when the page first loads
  useEffect(() => {
    async function fetchData() {
      try {
        // Invoke the API service to get the teacher's classes list
        const data = await academicService.getTeacherClasses();
        // Store the classes list in state
        setClasses(data);
      } catch (err) {
        // Log any database/network failures to the console
        console.error(err);
      } finally {
        // Turn off the loading page screen since database request has completed
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Empty dependency array ensures this effect runs exactly once when page loads

  // Use memoization to compute the filtered classes list whenever the class list or search term changes.
  // This avoids recalculating the filter logic on every re-render unless inputs actually change.
  const filtered = useMemo(() => {
    return classes.filter(c =>
      // Convert class name and course names into a single lowercase search string and check if user search term matches
      `${c.className} ${c.courses.join(' ')}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [classes, search]);

  // Render a standard full-page loading spinner if data has not yet returned from API
  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Title section detailing page headers and total count of classes */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <School size={24} className="text-accent" /> Mes Classes
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Les classes où vous enseignez — <span className="font-semibold text-slate-700 dark:text-slate-300">{classes.length}</span> classes
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-sm">
        {/* Search icon inside the search input */}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input 
          placeholder="Rechercher une classe, un cours..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-10" 
        />
      </div>

      {/* Grid displaying the filtered list of classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cls, i) => (
          <Card key={i} className="border-0 card-interactive group overflow-hidden">
            {/* Top decorative gradient bar on the card */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-600" />
            <CardContent className="p-5">
              
              {/* Header inside the class card: displays class name and count of weekly/total sessions */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{cls.className}</h3>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                  <CalendarDays size={12} className="text-accent" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{cls.sessionCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium">séances</span>
                </div>
              </div>

              {/* Bottom section of the card listing the specific courses taught to this class */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cours enseignés</p>
                <div className="flex flex-wrap gap-1.5">
                  {/* Map through each course and render it as a styled Badge */}
                  {cls.courses.map((course, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800">
                      <BookOpen size={10} className="mr-1" /> {course}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Render a fallback message if search filters out all classes */}
      {filtered.length === 0 && (
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <School size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Aucune classe trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
