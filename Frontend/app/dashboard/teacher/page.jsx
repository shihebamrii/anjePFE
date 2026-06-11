// Instruct the browser/Next.js to run this component on the client side (in the user's browser)
'use client';

// Import the React hooks to manage component state and run side-effects
import { useState, useEffect } from 'react';
// Import our custom authentication hook to access the logged-in user's information
import { useAuth } from '@/context/AuthContext';
// Import UI Card components to build clean, containerized UI boxes
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Import the UI Badge component to display small, colored labels/tags
import { Badge } from '@/components/ui/badge';
// Import a pre-styled full-page loading indicator
import { LoadingPage } from '@/components/ui/loading';
// Import the service used to fetch grades from the backend server
import { gradeService } from '@/services/gradeService';
// Import the service used to fetch attendance records from the backend server
import { attendanceService } from '@/services/attendanceService';
// Import the service used to fetch academic info (schedules, classes, courses) from the backend server
import { academicService } from '@/services/academicService';
// Import the service used to fetch event details from the backend server
import { eventService } from '@/services/eventService';
// Import a helper utility function to format dates nicely for display
import { formatDate } from '@/lib/utils';
// Import icons from the Lucide library to visually represent dashboard details
import {
  GraduationCap, ClipboardCheck, BookOpen, Calendar, School,
  ArrowRight, ArrowUpRight, CalendarDays, MapPin, Users
} from 'lucide-react';
// Import Next.js Link component to enable fast, client-side navigation between pages
import Link from 'next/link';

// Array representing names of the days of the week, starting with an empty slot for index 0
const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
// Object mapping time slot numbers (1-6) to their actual clock times
const TIME_LABELS = {
  1: '08:30 - 10:00', 2: '10:10 - 11:40', 3: '11:50 - 13:20',
  4: '14:00 - 15:30', 5: '15:40 - 17:10', 6: '17:20 - 18:50',
};

// Define and export the main component for the Teacher's Dashboard view
export default function TeacherDashboard() {
  // Extract the current logged-in user object from our authentication context provider
  const { user } = useAuth();
  // State variable to store the list of student grades created by this teacher
  const [grades, setGrades] = useState([]);
  // State variable to store the list of attendance records recorded by this teacher
  const [attendance, setAttendance] = useState([]);
  // State variable to store the list of courses taught by this teacher
  const [courses, setCourses] = useState([]);
  // State variable to store the list of classes assigned to this teacher
  const [classes, setClasses] = useState([]);
  // State variable to store only the class sessions scheduled for today
  const [todaySessions, setTodaySessions] = useState([]);
  // State variable to store the list of upcoming university events
  const [events, setEvents] = useState([]);
  // State variable to keep track of whether the data is currently being loaded from the API
  const [loading, setLoading] = useState(true);

  // Side-effect hook that runs once when the component mounts to fetch dashboard details from the backend
  useEffect(() => {
    // Define an asynchronous function to fetch all required dashboard metrics in parallel
    async function fetchData() {
      try {
        // Run all API calls concurrently using Promise.all to optimize loading performance.
        // If an individual API call fails, catch the error and fallback to an empty array so it doesn't break the load.
        const [g, a, c, cl, sch, e] = await Promise.all([
          gradeService.getGrades().catch(() => []), // Fetch teacher's grades
          attendanceService.getAttendance().catch(() => []), // Fetch attendance logs
          academicService.getTeacherCourses().catch(() => []), // Fetch teacher's courses
          academicService.getTeacherClasses().catch(() => []), // Fetch teacher's classes
          academicService.getTeacherSchedule().catch(() => []), // Fetch teacher's overall calendar schedule
          eventService.getEvents().catch(() => []), // Fetch portal events
        ]);
        // Update states with the retrieved backend data
        setGrades(g);
        setAttendance(a);
        setCourses(c);
        setClasses(cl);
        setEvents(e);

        // Filter the fetched schedule list to extract only the sessions that happen today
        const today = new Date().getDay(); // Get current day index from standard JS Date: 0 = Sunday, 1 = Monday, etc.
        // Convert JS standard day index (0 = Sunday) to our application's day index (1 = Monday ... 6 = Saturday)
        const dayOfWeek = today === 0 ? 7 : today; // Sunday is mapped to 7 (generally no classes are scheduled)
        
        // Filter out classes scheduled for any other day, and sort today's classes from earliest to latest time slots
        const todayFiltered = (sch || [])
          .filter(s => s.dayOfWeek === dayOfWeek)
          .sort((a, b) => a.timeSlot - b.timeSlot);
        // Save today's filtered sessions to component state
        setTodaySessions(todayFiltered);
      } catch (err) {
        // Log any unexpected errors that occur during the fetch process to the browser console
        console.error(err);
      } finally {
        // Turn off the loading spinner since we finished loading data (successfully or not)
        setLoading(false);
      }
    }
    // Execute the fetch function immediately
    fetchData();
  }, []); // Empty dependency array ensures this effect runs exactly once when the page loads

  // If the page is still loading, display a stylized full-page loading spinner with a custom message
  if (loading) return <LoadingPage message="Chargement de votre espace..." />;

  // Define an array of configuration objects to dynamically render the summary statistic cards at the top
  const statCards = [
    { icon: BookOpen, label: 'Mes Cours', value: courses.length, gradient: 'from-emerald-500 to-teal-600', link: '/dashboard/teacher/courses' },
    { icon: School, label: 'Mes Classes', value: classes.length, gradient: 'from-blue-500 to-cyan-600', link: '/dashboard/teacher/classes' },
    { icon: GraduationCap, label: 'Notes Créées', value: grades.length, gradient: 'from-violet-500 to-indigo-600', link: '/dashboard/grades' },
    { icon: ClipboardCheck, label: 'Présences', value: attendance.length, gradient: 'from-amber-500 to-orange-600', link: '/dashboard/attendance' },
  ];

  // Return the JSX layout structure that the browser will render
  return (
    <div className="space-y-8">
      {/* Welcome Banner Card showing the teacher's name and stats with a gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 p-8 text-white">
        {/* Decorative background visual elements */}
        <div className="absolute top-6 right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/[0.03] translate-y-1/3 -translate-x-1/4 blur-xl" />
        
        {/* Main Banner Content */}
        <div className="relative z-10">
          <p className="text-white/50 text-sm font-medium mb-1">Espace Enseignant</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Bonjour, Prof. {user?.lastName} 👋</h1>
          <p className="text-white/40 text-sm mt-1">
            {courses.length} cours • {classes.length} classes • {todaySessions.length} séance{todaySessions.length !== 1 ? 's' : ''} aujourd'hui
          </p>
        </div>
      </div>

      {/* Grid container to render the four statistics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat, i) => (
          // Link element wrapping the card to redirect the user on click
          <Link href={stat.link} key={i}>
            {/* Interactive card with scale hover animation */}
            <Card className="card-interactive cursor-pointer group border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  {/* Icon container with a colored gradient background */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="text-white" size={18} />
                  </div>
                  {/* Arrow icon suggesting navigation on click */}
                  <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-accent transition-colors" />
                </div>
                {/* Display the calculated numerical value of the statistic */}
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
                {/* Display the description label for the statistic */}
                <p className="text-sm text-slate-400 font-medium mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Grid container containing Today's Schedule and Recent Grades tables side-by-side */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today's Schedule Card */}
        <Card className="border-0">
          {/* Card Header with schedule label and a shortcut link to the full calendar */}
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <CalendarDays size={16} className="text-accent" /> Aujourd'hui
            </CardTitle>
            <Link href="/dashboard/teacher/schedule" className="text-accent text-xs font-semibold hover:underline flex items-center gap-1">
              Planning complet <ArrowRight size={12} />
            </Link>
          </CardHeader>
          
          {/* List of class sessions for today */}
          <CardContent className="space-y-1.5">
            {/* Render a fallback message if no sessions are scheduled for today */}
            {todaySessions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucune séance programmée aujourd'hui 🎉</p>
            ) : (
              // Map and display up to 5 scheduled class sessions for today
              todaySessions.slice(0, 5).map((session, i) => (
                // Color-coded session box depending on class type (PRACTICAL/TP = amber, TUTORIAL/TD = emerald, LECTURE/CR = blue)
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-l-4 transition-colors ${
                  session.type === 'PRACTICAL' ? 'bg-amber-50/50 dark:bg-amber-950/50 border-amber-500' : session.type === 'TUTORIAL' ? 'bg-emerald-50/50 dark:bg-emerald-950/50 border-emerald-500' : 'bg-blue-50/50 dark:bg-blue-950/50 border-blue-500'
                }`}>
                  <div className="flex-1 min-w-0">
                    {/* Course / Module Name */}
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{session.courseName || 'Module'}</p>
                    {/* Sub-info: Class/Group Name and Classroom Location */}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users size={10} /> {session.className}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin size={10} /> {session.room?.name || '—'}
                      </span>
                    </div>
                  </div>
                  {/* Right side: Time Slot and Session Type badge */}
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">{TIME_LABELS[session.timeSlot]}</span>
                    {/* Type badge (TP / TD / CR) with matching background colors */}
                    <Badge className={`block mt-1 text-[8px] uppercase tracking-wider font-black ${
                      session.type === 'PRACTICAL' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : session.type === 'TUTORIAL' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    }`}>
                      {session.type === 'PRACTICAL' ? 'TP' : session.type === 'TUTORIAL' ? 'TD' : 'CR'}
                      {session.group && ` - ${session.group}`}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Grades Card */}
        <Card className="border-0">
          {/* Card Header with grades label and a shortcut link to the general grades manager */}
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px]">Notes Récentes</CardTitle>
            <Link href="/dashboard/grades" className="text-accent text-xs font-semibold hover:underline">Gérer</Link>
          </CardHeader>
          
          {/* List of recent grades */}
          <CardContent className="space-y-1">
            {/* Map and display up to 5 recently entered student grades */}
            {grades.slice(0, 5).map((grade, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div>
                  {/* Course Name */}
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{grade.courseName}</p>
                  {/* Student Full Name and assessment type (e.g. DS, Exam) */}
                  <p className="text-[11px] text-slate-400">{grade.student?.firstName} {grade.student?.lastName} — {grade.type}</p>
                </div>
                {/* Score value / 20 */}
                <span className="text-sm font-bold text-accent">{grade.score}/20</span>
              </div>
            ))}
            {/* Fallback description shown if no grades have been posted yet */}
            {grades.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Aucune note créée</p>}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Card: only render this section if there are active events */}
      {events.length > 0 && (
        <Card className="border-0">
          {/* Header displaying event label and navigation links */}
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Calendar size={16} className="text-accent" /> Événements à venir
            </CardTitle>
            <Link href="/dashboard/events" className="text-accent text-xs font-semibold hover:underline">Voir tout</Link>
          </CardHeader>
          
          {/* List of upcoming events */}
          <CardContent className="space-y-1">
            {/* Display up to 3 upcoming events */}
            {events.slice(0, 3).map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div>
                  {/* Title/Description of the event */}
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{event.title}</p>
                  {/* Formatted date and event category type */}
                  <p className="text-[11px] text-slate-400">{formatDate(event.date)} — {event.type}</p>
                </div>
                {/* Audience Badge indicating target viewers (e.g. Students, Teachers, or Everyone) */}
                <Badge variant="secondary" className="text-[10px]">{event.audience || 'Tous'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
