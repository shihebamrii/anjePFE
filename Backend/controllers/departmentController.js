import Department from '../models/Department.js'; // Import Department database model
import User from '../models/User.js'; // Import User database model

// @desc    Get all departments (with teacher count, without full teacher list)
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    // Retrieve all departments from MongoDB
    const departments = await Department.find();
    // Map list to return simplified metadata objects instead of bulky sub-document arrays
    const result = departments.map((dept) => {
      return {
        _id: dept._id,
        name: dept.name,
        description: dept.description,
        head: dept.head,
        headEmail: dept.headEmail,
        teacherCount: dept.teachers.length, // Summarize teacher headcount length
        classCount: dept.classes.length, // Summarize class categories length
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req, res) => {
  try {
    const { name, description, head, headEmail } = req.body; // Extract department properties
    
    // Ensure department name uniqueness in the platform
    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Ce département existe déjà.' });

    // Save new Department document in DB
    const dept = await Department.create({ name, description, head, headEmail });
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req, res) => {
  try {
    const { name, description, head, headEmail } = req.body;
    // Find department document by route ID
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Update target fields conditionally
    if (name) dept.name = name;
    if (description !== undefined) dept.description = description;
    if (head) dept.head = head;
    if (headEmail) dept.headEmail = headEmail;

    // Save changes to DB
    await dept.save();
    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res) => {
  try {
    // Retrieve department document
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Remove the department from database
    await Department.deleteOne({ _id: req.params.id });
    res.json({ message: 'Département supprimé.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single department with all teachers
// @route   GET /api/departments/:id
// @access  Private
export const getDepartment = async (req, res) => {
  try {
    // Locate specific department by ID
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department); // Return full department document containing teachers array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department(s) managed by the logged-in chef
// @route   GET /api/departments/my
// @access  Private (CHEF_DEPT)
export const getMyDepartment = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase(); // Convert chef's email to lowercase
    // Fetch departments matching director's email address
    const departments = await Department.find({ headEmail: userEmail });

    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: 'No department found for this user' });
    }

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: find department owned by the logged-in department head (chef)
async function findChefDepartment(req) {
  return Department.findOne({ headEmail: req.user.email.toLowerCase() });
}

// ── Teacher CRUD ──────────────────────────────────────────

// @desc    Add a teacher to the chef's department
// @route   POST /api/departments/my/teachers
// @access  Private (CHEF_DEPT)
export const addTeacher = async (req, res) => {
  try {
    // Resolve chef's department
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    const { firstName, lastName, email, grade, gradeAbbr, specialization } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: 'Nom et prénom requis.' });

    // Push new sub-document info directly into the department teachers array
    dept.teachers.push({ firstName, lastName, email, grade, gradeAbbr, specialization });
    await dept.save(); // Save department document to persist changes

    const newTeacher = dept.teachers[dept.teachers.length - 1]; // Retrieve the newly appended teacher
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

    // Retrieve sub-document inside Mongoose sub-array using standard Mongoose .id() helper
    const teacher = dept.teachers.id(req.params.teacherId);
    if (!teacher) return res.status(404).json({ message: 'Enseignant introuvable.' });

    // Apply adjustments conditionally
    const { firstName, lastName, email, grade, gradeAbbr, specialization } = req.body;
    if (firstName !== undefined) teacher.firstName = firstName;
    if (lastName !== undefined) teacher.lastName = lastName;
    if (email !== undefined) teacher.email = email;
    if (grade !== undefined) teacher.grade = grade;
    if (gradeAbbr !== undefined) teacher.gradeAbbr = gradeAbbr;
    if (specialization !== undefined) teacher.specialization = specialization;

    await dept.save(); // Save edits in parent document
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

    // Find the target sub-document inside Mongoose sub-array
    const teacher = dept.teachers.id(req.params.teacherId);
    if (!teacher) return res.status(404).json({ message: 'Enseignant introuvable.' });

    teacher.deleteOne(); // Mark sub-document for deletion
    await dept.save(); // Persist changes on parent document
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

    // Push new sub-document into department classes array
    dept.classes.push({ name, level, track, students: students || 0, academicYear: academicYear || '2025-2026' });
    await dept.save();

    const newClass = dept.classes[dept.classes.length - 1]; // Retrieve the created class section
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

    // Retrieve the target sub-document inside class sub-array
    const cls = dept.classes.id(req.params.classId);
    if (!cls) return res.status(404).json({ message: 'Classe introuvable.' });

    // Apply properties updates
    const { name, level, track, students, academicYear } = req.body;
    if (name !== undefined) cls.name = name;
    if (level !== undefined) cls.level = level;
    if (track !== undefined) cls.track = track;
    if (students !== undefined) cls.students = students;
    if (academicYear !== undefined) cls.academicYear = academicYear;

    await dept.save(); // Save edits on parent document
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

    // Retrieve class sub-document
    const cls = dept.classes.id(req.params.classId);
    if (!cls) return res.status(404).json({ message: 'Classe introuvable.' });

    cls.deleteOne(); // Mark sub-document for deletion
    await dept.save(); // Commit edits
    res.json({ message: 'Classe supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add multiple students to a class (Bulk Import from Excel parsing)
// @route   POST /api/departments/my/classes/:classId/students/bulk
// @access  Private (CHEF_DEPT)
export const addBulkStudents = async (req, res) => {
  try {
    const dept = await findChefDepartment(req);
    if (!dept) return res.status(404).json({ message: 'Département introuvable.' });

    // Retrieve targeted class group sub-document
    const cls = dept.classes.id(req.params.classId);
    if (!cls) return res.status(404).json({ message: 'Classe introuvable.' });

    const { students } = req.body; // Array list of { firstName, lastName, email, registrationNumber }
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Aucun étudiant fourni.' });
    }

    let addedCount = 0; // Initialize successfully registered student counter
    const errors = []; // Collect individual registration feedback errors
    const defaultPassword = 'iset123'; // Default password issued for new student accounts

    // Iterate through list to create user profiles in bulk
    for (const s of students) {
      // Validate that mandatory user parameters exist
      if (!s.firstName || !s.lastName || !s.email) {
        errors.push(`Données incomplètes pour ${s.email || 'un étudiant'}`);
        continue;
      }

      // Check if email already exists in system to prevent duplicate index exceptions
      const existingUser = await User.findOne({ email: s.email.toLowerCase() });
      if (existingUser) {
        errors.push(`L'email ${s.email} existe déjà.`);
        continue;
      }

      // Create new student user document
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
        addedCount++; // Increment successful inserts count
      } catch (err) {
        errors.push(`Erreur lors de la création de ${s.email}: ${err.message}`);
      }
    }

    // Update the class enrollment students headcount number if new profiles were added
    if (addedCount > 0) {
      cls.students = (cls.students || 0) + addedCount;
      await dept.save(); // Save updated parent department document
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
