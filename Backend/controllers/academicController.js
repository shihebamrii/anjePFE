import Course from '../models/Course.js';
import Room from '../models/Room.js';
import Department from '../models/Department.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

// @desc    Get courses for the logged-in chef's department
// @route   GET /api/academic/courses
// @access  Private/ChefDept
export const getMyCourses = async (req, res) => {
  try {
    const department = await Department.findOne({ headEmail: req.user.email });
    if (!department) {
      return res.status(404).json({ message: 'Aucun département trouvé pour cet utilisateur.' });
    }
    const courses = await Course.find({ department: department._id }).sort({ semester: 1, level: 1, name: 1 });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des cours' });
  }
};

// @desc    Get all rooms
// @route   GET /api/academic/rooms
// @access  Private/ChefDept/Admin
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ building: 1, name: 1 });
    res.json(rooms);
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
    const department = await Department.findOne({ headEmail: req.user.email });
    if (!department) {
      return res.status(404).json({ message: 'Aucun département trouvé pour cet utilisateur.' });
    }
    const students = await User.find({ role: 'STUDENT', department: department._id.toString() }).select('-password').sort({ className: 1, lastName: 1 });
    res.json(students);
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
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ message: 'Le paramètre classId est requis' });
    }

    // Verify the class belongs to the chef's department
    const department = await Department.findOne({ headEmail: req.user.email });
    if (!department) {
       return res.status(404).json({ message: 'Accès bloqué.' });
    }

    const classExists = department.classes.some(c => c.externalId === classId || c._id.toString() === classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Classe introuvable dans votre département.' });
    }

    // Fetch the timetable blocks
    const sessions = await Session.find({ classId }).sort({ dayOfWeek: 1, timeSlot: 1 });
    res.json(sessions);

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
    const classId = req.user.classId;

    if (!classId) {
      return res.status(400).json({ message: "Aucune classe n'est associée à votre profil." });
    }

    // Sessions are stored using the external Chronaxis class identifier.
    // We must resolve the student's internal MongoDB classId to the externalId.
    const dept = await Department.findOne({ 'classes._id': classId });
    if (!dept) {
      return res.status(404).json({ message: "Département introuvable pour votre classe." });
    }

    const classObj = dept.classes.find(c => c._id.toString() === classId.toString());
    if (!classObj) {
      return res.status(404).json({ message: "Classe introuvable dans votre département." });
    }

    // Sessions are stored using either externalId or internal Mongo _id.
    // Try finding by externalId if present, else use the internal one.
    const queryId = classObj.externalId || req.user.classId.toString();

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
    const { firstName, lastName } = req.user;

    if (!lastName) {
      return res.status(400).json({ message: "Profil enseignant incomplet." });
    }

    // Chronaxis imported sessions store the teacher name as a string (e.g. "HAMMAMI Walid" or "Walid HAMMAMI").
    // We use a regex combination lookahead to match strings containing BOTH the first name and last name in any order.
    const terms = [firstName, lastName].filter(Boolean);
    const regexPattern = terms.map(t => `(?=.*${t})`).join('');
    const teacherNameRegex = new RegExp(`^${regexPattern}.*$`, 'i');

    const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } }).sort({ dayOfWeek: 1, timeSlot: 1 });
    res.json(sessions);

  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de votre emploi du temps." });
  }
};

// Helper to build a regex that matches teacher name in any order
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
    const { firstName, lastName } = req.user;
    if (!lastName) return res.status(400).json({ message: 'Profil enseignant incomplet.' });

    const teacherNameRegex = buildTeacherNameRegex(firstName, lastName);
    const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } });

    // Deduplicate by courseName + className + type
    const courseMap = new Map();
    sessions.forEach(s => {
      const key = `${s.courseName || 'N/A'}__${s.className || 'N/A'}__${s.type || 'LECTURE'}`;
      if (!courseMap.has(key)) {
        courseMap.set(key, {
          courseName: s.courseName || 'Module inconnu',
          className: s.className || 'Classe inconnue',
          type: s.type || 'LECTURE',
          classId: s.classId,
          slots: [],
        });
      }
      courseMap.get(key).slots.push({
        dayOfWeek: s.dayOfWeek,
        timeSlot: s.timeSlot,
        room: s.room?.name || 'N/A',
        group: s.group || '',
      });
    });

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

    const teacherNameRegex = buildTeacherNameRegex(firstName, lastName);
    const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } });

    // Deduplicate by className
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

    // Convert Set to array for JSON serialization
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

// Helper: find department owned by the logged-in chef
async function findChefDept(req) {
  return Department.findOne({ headEmail: req.user.email.toLowerCase() });
}

// ── Student CRUD ──────────────────────────────────────────

// @desc    Add a student to the chef's department
// @route   POST /api/academic/students
// @access  Private/ChefDept
export const addStudent = async (req, res) => {
  try {
    const dept = await findChefDept(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const { firstName, lastName, email, registrationNumber, classId, className, password } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Nom, prénom et email requis.' });
    }

    // Verify the class belongs to this department if provided
    if (classId) {
      const classExists = dept.classes.some(c => c._id.toString() === classId);
      if (!classExists) {
        return res.status(400).json({ message: 'Classe introuvable dans votre département.' });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    const student = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: password || 'iset123',
      role: 'STUDENT',
      department: dept._id.toString(),
      registrationNumber: registrationNumber || '',
      classId: classId || undefined,
      className: className || '',
    });

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

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'STUDENT' || student.department !== dept._id.toString()) {
      return res.status(404).json({ message: 'Étudiant introuvable dans votre département.' });
    }

    const { firstName, lastName, email, registrationNumber, classId, className } = req.body;
    if (firstName !== undefined) student.firstName = firstName;
    if (lastName !== undefined) student.lastName = lastName;
    if (email !== undefined) student.email = email.toLowerCase();
    if (registrationNumber !== undefined) student.registrationNumber = registrationNumber;
    if (classId !== undefined) student.classId = classId || undefined;
    if (className !== undefined) student.className = className;

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

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'STUDENT' || student.department !== dept._id.toString()) {
      return res.status(404).json({ message: 'Étudiant introuvable dans votre département.' });
    }

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

    const course = await Course.findById(req.params.id);
    if (!course || course.department.toString() !== dept._id.toString()) {
      return res.status(404).json({ message: 'Cours introuvable dans votre département.' });
    }

    const { name, code, semester, level, hours, trackName } = req.body;
    if (name !== undefined) course.name = name;
    if (code !== undefined) course.code = code;
    if (semester !== undefined) course.semester = semester;
    if (level !== undefined) course.level = level;
    if (hours !== undefined) course.hours = hours;
    if (trackName !== undefined) course.trackName = trackName;

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

    const course = await Course.findById(req.params.id);
    if (!course || course.department.toString() !== dept._id.toString()) {
      return res.status(404).json({ message: 'Cours introuvable dans votre département.' });
    }

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
    
    // Verify class belongs to dept
    const classExists = dept.classes.some(c => c.externalId === classId || c._id.toString() === classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Classe introuvable dans votre département.' });
    }

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

    // Find session
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session introuvable.' });

    // Verify class belongs to dept
    const classExists = dept.classes.some(c => c.externalId === session.classId || c._id.toString() === session.classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Accès non autorisé à cette session.' });
    }

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

    // Find session
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session introuvable.' });

    // Verify class belongs to dept
    const classExists = dept.classes.some(c => c.externalId === session.classId || c._id.toString() === session.classId);
    if (!classExists) {
        return res.status(403).json({ message: 'Accès non autorisé à cette session.' });
    }

    await session.deleteOne();
    res.json({ message: 'Session supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
