import Grade from '../models/Grade.js'; // Import Grade database model
import User from '../models/User.js'; // Import User database model
import * as XLSX from 'xlsx'; // Import SheetJS (XLSX) to parse Excel sheets

// @desc    Get all grades for a student
// @route   GET /api/grades
// @access  Private (Student sees own, Admin/Teacher see based on query)
export const getGrades = async (req, res) => {
  try {
    const { studentId, semester } = req.query; // Extract optional search parameters from request query
    let query = {};

    // Role-based authorization scoping for queries
    if (req.user.role === 'STUDENT') {
      // Students are restricted to querying only their own grade documents
      query.student = req.user._id;
    } else if (req.user.role === 'TEACHER') {
      // Teachers view grades they awarded, optionally filtered by a specific student ID
      query.teacher = req.user._id;
      if (studentId) query.student = studentId;
    } else if (studentId) {
      // Admins/others can query grades filtered by a target student ID
      query.student = studentId;
    }

    // Filter by semester if provided
    if (semester) {
      query.semester = semester;
    }

    // Query database, populate details, and sort from newest to oldest
    const grades = await Grade.find(query)
      .populate('teacher', 'firstName lastName')
      .populate('student', 'firstName lastName studentId')
      .sort({ date: -1 });
      
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a grade
// @route   POST /api/grades
// @access  Private/Teacher/Admin
export const addGrade = async (req, res) => {
  try {
    const { student, courseName, department, subject, score, coefficient, semester, type, notes } = req.body;

    // Construct a new Grade document, binding it to the current teacher ID from the session context
    const grade = new Grade({
      student,
      teacher: req.user._id,
      courseName,
      department,
      subject,
      score,
      coefficient,
      semester,
      type,
      notes,
    });

    // Save grade to database
    const createdGrade = await grade.save();
    res.status(201).json(createdGrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a grade
// @route   DELETE /api/grades/:id
// @access  Private/Teacher/Admin
export const deleteGrade = async (req, res) => {
  try {
    // Locate target grade document
    const grade = await Grade.findById(req.params.id);

    if (grade) {
      // Access check: only Admin users or the Teacher who created the grade record can delete it
      if (req.user.role === 'ADMIN' || grade.teacher.toString() === req.user._id.toString()) {
        await Grade.deleteOne({ _id: grade._id }); // Delete record
        res.json({ message: 'Grade removed' });
      } else {
        res.status(403).json({ message: 'Not authorized to delete this grade' });
      }
    } else {
      res.status(404).json({ message: 'Grade not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk upload grades from Excel file
// @route   POST /api/grades/bulk-upload
// @access  Private/Teacher/Admin
export const bulkUploadGrades = async (req, res) => {
  try {
    // Validate that a file payload is present in the multipart request buffer
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { courseName, department, subject, semester, type, coefficient } = req.body; // Common metadata attributes

    // Validate that all required common metadata fields are provided
    if (!courseName || !department || !subject || !semester || !type) {
      return res.status(400).json({ message: 'Tous les champs communs sont requis (courseName, department, subject, semester, type)' });
    }

    // Parse the Excel file from the memory buffer using the XLSX sheet parser
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Retrieve first sheet in workbook
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet); // Convert sheet records to JSON row arrays

    if (!rows.length) {
      return res.status(400).json({ message: 'Le fichier Excel est vide' });
    }

    // Validate that required headers/columns exist in the first row
    const firstRow = rows[0];
    if (!('studentId' in firstRow) || !('score' in firstRow)) {
      return res.status(400).json({ message: 'Le fichier doit contenir les colonnes "studentId" et "score"' });
    }

    const results = { created: 0, errors: [] }; // Track results report count and collection errors list
    const gradesToCreate = []; // Array containing Mongoose documents for bulk write operations

    // Loop through each sheet row to parse details
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Data rows start at index 2 (row index 1 holds header titles)
      const sid = String(row.studentId || '').trim(); // Resolve student ID string
      const score = Number(row.score); // Parse score numeric value

      // Check if studentId is empty or missing
      if (!sid) {
        results.errors.push({ row: rowNum, studentId: sid, reason: 'studentId manquant' });
        continue;
      }

      // Check score range boundary validation
      if (isNaN(score) || score < 0 || score > 20) {
        results.errors.push({ row: rowNum, studentId: sid, reason: `Score invalide: ${row.score} (doit être entre 0 et 20)` });
        continue;
      }

      // Look up student ObjectId in DB using the studentId code
      const student = await User.findOne({ studentId: sid, role: 'STUDENT' });
      if (!student) {
        results.errors.push({ row: rowNum, studentId: sid, reason: 'Étudiant introuvable' });
        continue;
      }

      // Append validated grade document to collection array list
      gradesToCreate.push({
        student: student._id,
        teacher: req.user._id,
        courseName,
        department,
        subject,
        score,
        coefficient: Number(coefficient) || 1,
        semester,
        type,
        notes: row.notes ? String(row.notes) : '',
      });
    }

    // Execute bulk write insertion if array list holds any valid documents
    if (gradesToCreate.length > 0) {
      await Grade.insertMany(gradesToCreate);
      results.created = gradesToCreate.length;
    }

    res.status(201).json(results); // Send back resolution report statistics
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: error.message });
  }
};
