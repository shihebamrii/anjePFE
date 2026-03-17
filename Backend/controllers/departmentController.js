import Department from '../models/Department.js';
import User from '../models/User.js';

// @desc    Get all departments (with teacher count, without full teacher list)
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().select('-teachers');
    const result = await Promise.all(
      departments.map(async (dept) => {
        const full = await Department.findById(dept._id);
        return {
          _id: dept._id,
          name: dept.name,
          description: dept.description,
          head: dept.head,
          headEmail: dept.headEmail,
          teacherCount: full.teachers.length,
        };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single department with all teachers
// @route   GET /api/departments/:id
// @access  Private
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department(s) managed by the logged-in chef
// @route   GET /api/departments/my
// @access  Private (CHEF_DEPT)
export const getMyDepartment = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const departments = await Department.find({ headEmail: userEmail });

    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: 'No department found for this user' });
    }

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: find department owned by the logged-in chef
async function findChefDepartment(req) {
  return Department.findOne({ headEmail: req.user.email.toLowerCase() });
}

// ── Teacher CRUD ──────────────────────────────────────────

// @desc    Add a teacher to the chef's department
// @route   POST /api/departments/my/teachers
// @access  Private (CHEF_DEPT)
export const addTeacher = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const { firstName, lastName, email, grade, gradeAbbr, specialization } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: 'Nom et prénom requis.' });

    dept.teachers.push({ firstName, lastName, email, grade, gradeAbbr, specialization });
    await dept.save();

    const newTeacher = dept.teachers[dept.teachers.length - 1];
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a teacher in the chef's department
// @route   PUT /api/departments/my/teachers/:teacherId
// @access  Private (CHEF_DEPT)
export const updateTeacher = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const teacher = dept.teachers.id(req.params.teacherId);
    if (!teacher) return res.status(404).json({ message: 'Enseignant introuvable.' });

    const { firstName, lastName, email, grade, gradeAbbr, specialization } = req.body;
    if (firstName !== undefined) teacher.firstName = firstName;
    if (lastName !== undefined) teacher.lastName = lastName;
    if (email !== undefined) teacher.email = email;
    if (grade !== undefined) teacher.grade = grade;
    if (gradeAbbr !== undefined) teacher.gradeAbbr = gradeAbbr;
    if (specialization !== undefined) teacher.specialization = specialization;

    await dept.save();
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a teacher from the chef's department
// @route   DELETE /api/departments/my/teachers/:teacherId
// @access  Private (CHEF_DEPT)
export const deleteTeacher = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const teacher = dept.teachers.id(req.params.teacherId);
    if (!teacher) return res.status(404).json({ message: 'Enseignant introuvable.' });

    teacher.deleteOne();
    await dept.save();
    res.json({ message: 'Enseignant supprimé.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Class CRUD ──────────────────────────────────────────

// @desc    Add a class to the chef's department
// @route   POST /api/departments/my/classes
// @access  Private (CHEF_DEPT)
export const addClass = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const { name, level, track, students, academicYear } = req.body;
    if (!name || !level) return res.status(400).json({ message: 'Nom et niveau requis.' });

    dept.classes.push({ name, level, track, students: students || 0, academicYear: academicYear || '2025-2026' });
    await dept.save();

    const newClass = dept.classes[dept.classes.length - 1];
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a class in the chef's department
// @route   PUT /api/departments/my/classes/:classId
// @access  Private (CHEF_DEPT)
export const updateClass = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const cls = dept.classes.id(req.params.classId);
    if (!cls) return res.status(404).json({ message: 'Classe introuvable.' });

    const { name, level, track, students, academicYear } = req.body;
    if (name !== undefined) cls.name = name;
    if (level !== undefined) cls.level = level;
    if (track !== undefined) cls.track = track;
    if (students !== undefined) cls.students = students;
    if (academicYear !== undefined) cls.academicYear = academicYear;

    await dept.save();
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a class from the chef's department
// @route   DELETE /api/departments/my/classes/:classId
// @access  Private (CHEF_DEPT)
export const deleteClass = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const cls = dept.classes.id(req.params.classId);
    if (!cls) return res.status(404).json({ message: 'Classe introuvable.' });

    cls.deleteOne();
    await dept.save();
    res.json({ message: 'Classe supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add multiple students to a class (Bulk Import)
// @route   POST /api/departments/my/classes/:classId/students/bulk
// @access  Private (CHEF_DEPT)
export const addBulkStudents = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const cls = dept.classes.id(req.params.classId);
    if (!cls) return res.status(404).json({ message: 'Classe introuvable.' });

    const { students } = req.body; // Array of { firstName, lastName, email, registrationNumber }
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Aucun étudiant fourni.' });
    }

    let addedCount = 0;
    const errors = [];
    const defaultPassword = 'iset123';

    for (const s of students) {
      if (!s.firstName || !s.lastName || !s.email) {
        errors.push(`Données incomplètes pour ${s.email || 'un étudiant'}`);
        continue;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: s.email.toLowerCase() });
      if (existingUser) {
        errors.push(`L'email ${s.email} existe déjà.`);
        continue;
      }

      // Create new student
      try {
        await User.create({
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email.toLowerCase(),
          password: defaultPassword,
          role: 'STUDENT',
          department: dept._id.toString(),
          classId: cls._id,
          className: cls.name,
          registrationNumber: s.registrationNumber || '',
          studentId: s.registrationNumber || '',
        });
        addedCount++;
      } catch (err) {
        errors.push(`Erreur lors de la création de ${s.email}: ${err.message}`);
      }
    }

    // Update class student count
    if (addedCount > 0) {
      cls.students = (cls.students || 0) + addedCount;
      await dept.save();
    }

    res.status(201).json({
      message: `${addedCount} étudiant(s) ajouté(s) avec succès.`,
      addedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
