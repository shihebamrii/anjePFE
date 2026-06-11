import Course from '../models/Course.js'; // Import Course database model
import Room from '../models/Room.js'; // Import Room database model
import Department from '../models/Department.js'; // Import Department database model
import Session from '../models/Session.js'; // Import Session database model
import User from '../models/User.js'; // Import User database model

// @desc    Get courses for the logged-in chef's department
// @route   GET /api/academic/courses
// @access  Private/ChefDept
export const getMyCourses = async (req, res) => {
  try {
    // Locate the department where the current logged-in user's email matches the headEmail
    const department = await Department.findOne({ headEmail: req.user.email });
    if (!department) {
      // Return 404 if no department is associated with this email
      return res.status(404).json({ message: 'Aucun département trouvé pour cet utilisateur.' });
    }
    // Fetch all courses that belong to the resolved department, sorted by semester, level, and name
    const courses = await Course.find({ department: department._id }).sort({ semester: 1, level: 1, name: 1 });
    res.json(courses); // Return the list of courses as a JSON response
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return 500 server error response if something fails
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des cours' });
  }
};

// @desc    Get all rooms
// @route   GET /api/academic/rooms
// @access  Private/ChefDept/Admin
export const getRooms = async (req, res) => {
  try {
    // Find all classrooms, sorted alphabetically by building and then by room name
    const rooms = await Room.find({}).sort({ building: 1, name: 1 });
    res.json(rooms); // Send the list of rooms back to the client
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des salles' });
  }
};

// @desc    Get all students for the logged-in chef's department
// @route   GET /api/academic/students
// @access  Private/ChefDept
export const getStudents = async (req, res) => {
  try {
    // Query the database to find the department managed by this chef
    const department = await Department.findOne({ headEmail: req.user.email });
    if (!department) {
      return res.status(404).json({ message: 'Aucun département trouvé pour cet utilisateur.' });
    }
    // Find all active students in the department, exclude password fields, and sort them
    const students = await User.find({ role: 'STUDENT', department: department._id.toString() }).select('-password').sort({ className: 1, lastName: 1 });
    res.json(students); // Send back the filtered student list
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des étudiants' });
  }
};

// @desc    Get Class Schedule
// @route   GET /api/academic/schedule?classId=123
// @access  Private/ChefDept
export const getSchedule = async (req, res) => {
  try {
    const { classId } = req.query; // Extract target class identifier from the request query string

    if (!classId) {
      // Validate that classId was provided
      return res.status(400).json({ message: 'Le paramètre classId est requis' });
    }

    // Verify the class belongs to the logged-in department head's department
    const department = await Department.findOne({ headEmail: req.user.email });
    if (!department) {
       return res.status(404).json({ message: 'Accès bloqué.' });
    }

    // Check if the requested class exists in the chef's department classes list
    const classExists = department.classes.some(c => c.externalId === classId || c._id.toString() === classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Classe introuvable dans votre département.' });
    }

    // Fetch the scheduled timetables (sessions) for the class, sorted by day of the week and daily timeslot
    const sessions = await Session.find({ classId }).sort({ dayOfWeek: 1, timeSlot: 1 });
    res.json(sessions); // Return the timetable slots

  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'emploi du temps" });
  }
};

// @desc    Get Schedule for the logged-in Student
// @route   GET /api/academic/schedule/student
// @access  Private/Student
export const getStudentSchedule = async (req, res) => {
  try {
    const classId = req.user.classId; // Retrieve class ID from the authenticated student profile

    if (!classId) {
      return res.status(400).json({ message: "Aucune classe n'est associée à votre profil." });
    }

    // Locate the department that contains the student's class group
    const dept = await Department.findOne({ 'classes._id': classId });
    if (!dept) {
      return res.status(404).json({ message: "Département introuvable pour votre classe." });
    }

    // Extract the specific class object from the department class array
    const classObj = dept.classes.find(c => c._id.toString() === classId.toString());
    if (!classObj) {
      return res.status(404).json({ message: "Classe introuvable dans votre département." });
    }

    // Sessions might be queried by externalId (from syncs) or local database ObjectId
    const queryId = classObj.externalId || req.user.classId.toString();

    // Find and return the schedule sessions matching the resolved class query ID
    const sessions = await Session.find({ classId: queryId }).sort({ dayOfWeek: 1, timeSlot: 1 });
    res.json(sessions);

  } catch (error) {
    console.error('Error fetching student schedule:', error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de votre emploi du temps." });
  }
};

// @desc    Get Schedule for the logged-in Teacher
// @route   GET /api/academic/schedule/teacher
// @access  Private/Teacher
export const getTeacherSchedule = async (req, res) => {
  try {
    const { firstName, lastName } = req.user; // Extract teacher's name from request user object

    if (!lastName) {
      return res.status(400).json({ message: "Profil enseignant incomplet." });
    }

    // Timetables imported from external tools store teacher name as a combined string (e.g. "HAMMAMI Walid").
    // We dynamically build a regex looking for both first and last name in any order to match the record.
    const terms = [firstName, lastName].filter(Boolean);
    const regexPattern = terms.map(t => `(?=.*${t})`).join('');
    const teacherNameRegex = new RegExp(`^${regexPattern}.*$`, 'i');

    // Query database for sessions matching the teacher's name regex, sorted by day and time
    const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } }).sort({ dayOfWeek: 1, timeSlot: 1 });
    res.json(sessions);

  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de votre emploi du temps." });
  }
};

// Helper: build a regex that matches teacher name in any order (case-insensitive)
function buildTeacherNameRegex(firstName, lastName) {
  const terms = [firstName, lastName].filter(Boolean);
  const regexPattern = terms.map(t => `(?=.*${t})`).join('');
  return new RegExp(`^${regexPattern}.*$`, 'i');
}

// @desc    Get courses assigned to the logged-in teacher (derived from sessions)
// @route   GET /api/academic/teacher/courses
// @access  Private/Teacher
export const getTeacherCourses = async (req, res) => {
  try {
    const { firstName, lastName, department } = req.user;
    if (!lastName) return res.status(400).json({ message: 'Profil enseignant incomplet.' });

    // Build regex to search for teacher's name across scheduled classes
    const teacherNameRegex = buildTeacherNameRegex(firstName, lastName);
    const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } });

    // Deduplicate and group sessions by course name, class name, and lecture type
    const courseMap = new Map();
    sessions.forEach(s => {
      const key = `${s.courseName || 'N/A'}__${s.className || 'N/A'}__${s.type || 'LECTURE'}`;
      if (!courseMap.has(key)) {
        courseMap.set(key, {
          courseName: s.courseName || 'Module inconnu',
          className: s.className || 'Classe inconnue',
          type: s.type || 'LECTURE',
          classId: s.classId,
          department: department || '',
          slots: [],
        });
      }
      // Push the time and room details into the group slots array
      courseMap.get(key).slots.push({
        dayOfWeek: s.dayOfWeek,
        timeSlot: s.timeSlot,
        room: s.room?.name || 'N/A',
        group: s.group || '',
      });
    });

    // Send the aggregated list of courses back to the teacher
    res.json(Array.from(courseMap.values()));
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc    Get classes the logged-in teacher teaches (derived from sessions)
// @route   GET /api/academic/teacher/classes
// @access  Private/Teacher
export const getTeacherClasses = async (req, res) => {
  try {
    const { firstName, lastName } = req.user;
    if (!lastName) return res.status(400).json({ message: 'Profil enseignant incomplet.' });

    // Query all sessions for this teacher using case-insensitive regex
    const teacherNameRegex = buildTeacherNameRegex(firstName, lastName);
    const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } });

    // Group sessions by class name to extract unique classes and distinct subjects taught
    const classMap = new Map();
    sessions.forEach(s => {
      const name = s.className || 'Classe inconnue';
      if (!classMap.has(name)) {
        classMap.set(name, {
          className: name,
          classId: s.classId,
          courses: new Set(),
          sessionCount: 0,
        });
      }
      const entry = classMap.get(name);
      entry.courses.add(s.courseName || 'Module inconnu');
      entry.sessionCount++;
    });

    // Convert Set collection values back to array for proper JSON serialization
    const result = Array.from(classMap.values()).map(c => ({
      ...c,
      courses: Array.from(c.courses),
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Helper: find department managed by the logged-in Chef de Département
async function findChefDept(req) {
  return Department.findOne({ headEmail: req.user.email.toLowerCase() });
}

// ── Student CRUD ──────────────────────────────────────────

// @desc    Add a student to the chef's department
// @route   POST /api/academic/students
// @access  Private/ChefDept
export const addStudent = async (req, res) => {
  try {
    // Resolve current department head's department object
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Destructure required registration attributes from post body request
    const { firstName, lastName, email, registrationNumber, classId, className, password } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Nom, prénom et email requis.' });
    }

    // Verify the requested student class actually belongs to this department
    if (classId) {
      const classExists = dept.classes.some(c => c._id.toString() === classId);
      if (!classExists) {
        return res.status(400).json({ message: 'Classe introuvable dans votre département.' });
      }
    }

    // Check that email is not already taken in the system
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Create the student account document
    const student = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: password || 'iset123', // Default password if none provided
      role: 'STUDENT',
      department: dept._id.toString(),
      registrationNumber: registrationNumber || '',
      classId: classId || undefined,
      className: className || '',
    });

    // Send back response excluding secret keys/passwords
    res.status(201).json({ _id: student._id, firstName: student.firstName, lastName: student.lastName, email: student.email, registrationNumber: student.registrationNumber, className: student.className });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a student
// @route   PUT /api/academic/students/:id
// @access  Private/ChefDept
export const updateStudent = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Query target student in database
    const student = await User.findById(req.params.id);
    // Ensure student exists, has STUDENT role, and belongs to the chef's department
    if (!student || student.role !== 'STUDENT' || student.department !== dept._id.toString()) {
      return res.status(404).json({ message: 'Étudiant introuvable dans votre département.' });
    }

    // Update fields conditionally if they are present in request body
    const { firstName, lastName, email, registrationNumber, classId, className } = req.body;
    if (firstName !== undefined) student.firstName = firstName;
    if (lastName !== undefined) student.lastName = lastName;
    if (email !== undefined) student.email = email.toLowerCase();
    if (registrationNumber !== undefined) student.registrationNumber = registrationNumber;
    if (classId !== undefined) student.classId = classId || undefined;
    if (className !== undefined) student.className = className;

    // Save modifications to DB
    await student.save();
    res.json({ _id: student._id, firstName: student.firstName, lastName: student.lastName, email: student.email, registrationNumber: student.registrationNumber, className: student.className });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a student
// @route   DELETE /api/academic/students/:id
// @access  Private/ChefDept
export const deleteStudent = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Fetch the student profile by ID
    const student = await User.findById(req.params.id);
    // Secure verification check
    if (!student || student.role !== 'STUDENT' || student.department !== dept._id.toString()) {
      return res.status(404).json({ message: 'Étudiant introuvable dans votre département.' });
    }

    // Delete student document from DB
    await student.deleteOne();
    res.json({ message: 'Étudiant supprimé.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Course CRUD ──────────────────────────────────────────

// @desc    Add a course to the chef's department
// @route   POST /api/academic/courses
// @access  Private/ChefDept
export const addCourse = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const { name, code, semester, level, hours, trackName } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'Nom et code requis.' });

    // Create course document in database, assigning it to the resolved department
    const course = await Course.create({
      name,
      code,
      semester: semester || 1,
      level: level || 1,
      hours: hours || { lectures: 0, tutorials: 0, practicals: 0 },
      department: dept._id,
      trackName: trackName || '',
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/academic/courses/:id
// @access  Private/ChefDept
export const updateCourse = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Retrieve the course profile
    const course = await Course.findById(req.params.id);
    // Ensure the course exists and belongs to the chef's department
    if (!course || course.department.toString() !== dept._id.toString()) {
      return res.status(404).json({ message: 'Cours introuvable dans votre département.' });
    }

    // Assign new field values to the course document
    const { name, code, semester, level, hours, trackName } = req.body;
    if (name !== undefined) course.name = name;
    if (code !== undefined) course.code = code;
    if (semester !== undefined) course.semester = semester;
    if (level !== undefined) course.level = level;
    if (hours !== undefined) course.hours = hours;
    if (trackName !== undefined) course.trackName = trackName;

    // Persist edits to database
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/academic/courses/:id
// @access  Private/ChefDept
export const deleteCourse = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Retrieve the target course by ID
    const course = await Course.findById(req.params.id);
    // Authorization security check
    if (!course || course.department.toString() !== dept._id.toString()) {
      return res.status(404).json({ message: 'Cours introuvable dans votre département.' });
    }

    // Delete course record
    await course.deleteOne();
    res.json({ message: 'Cours supprimé.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Session CRUD ──────────────────────────────────────────

// @desc    Add a schedule session
// @route   POST /api/academic/sessions
// @access  Private/ChefDept
export const addSession = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const { course, courseName, teacher, room, classId, className, type, dayOfWeek, timeSlot, semester, group } = req.body;
    
    // Ensure the target student class belongs to the chef's department classes array
    const classExists = dept.classes.some(c => c.externalId === classId || c._id.toString() === classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Classe introuvable dans votre département.' });
    }

    // Create session document
    const session = await Session.create({
      course, courseName, teacher, room, classId, className, type, dayOfWeek, timeSlot, semester, group
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a schedule session
// @route   PUT /api/academic/sessions/:id
// @access  Private/ChefDept
export const updateSession = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Locate session document by ID
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session introuvable.' });

    // Confirm that the session's class belongs to the logged-in department
    const classExists = dept.classes.some(c => c.externalId === session.classId || c._id.toString() === session.classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Accès non autorisé à cette session.' });
    }

    // Conditionally assign fields if passed in request body parameters
    const { course, courseName, teacher, room, classId, className, type, dayOfWeek, timeSlot, semester, group } = req.body;
    
    if (course !== undefined) session.course = course;
    if (courseName !== undefined) session.courseName = courseName;
    if (teacher !== undefined) session.teacher = teacher;
    if (room !== undefined) session.room = room;
    if (classId !== undefined) session.classId = classId;
    if (className !== undefined) session.className = className;
    if (type !== undefined) session.type = type;
    if (dayOfWeek !== undefined) session.dayOfWeek = dayOfWeek;
    if (timeSlot !== undefined) session.timeSlot = timeSlot;
    if (semester !== undefined) session.semester = semester;
    if (group !== undefined) session.group = group;

    // Save adjustments to DB
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a schedule session
// @route   DELETE /api/academic/sessions/:id
// @access  Private/ChefDept
export const deleteSession = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Fetch scheduled session
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session introuvable.' });

    // Authorize delete action: check if class is registered in the chef's department
    const classExists = dept.classes.some(c => c.externalId === session.classId || c._id.toString() === session.classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Accès non autorisé à cette session.' });
    }

    // Delete session from DB
    await session.deleteOne();
    res.json({ message: 'Session supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
