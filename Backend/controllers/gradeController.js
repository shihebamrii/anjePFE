import Grade from '../models/Grade.js';
import User from '../models/User.js';
import * as XLSX from 'xlsx';

// @desc    Get all grades for a student
// @route   GET /api/grades
// @access  Private (Student sees own, Admin/Teacher see based on query)
export const getGrades = async (req, res) => {
  try {
    const { studentId, semester } = req.query;
    let query = {};

    // Role-based scoping
    if (req.user.role === 'STUDENT') {
      query.student = req.user._id;
    } else if (req.user.role === 'TEACHER') {
      query.teacher = req.user._id;
      if (studentId) query.student = studentId;
    } else if (studentId) {
      query.student = studentId;
    }

    if (semester) {
      query.semester = semester;
    }

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
    const grade = await Grade.findById(req.params.id);

    if (grade) {
      // Allow admin or the teacher who created it
      if (req.user.role === 'ADMIN' || grade.teacher.toString() === req.user._id.toString()) {
        await Grade.deleteOne({ _id: grade._id });
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
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { courseName, department, subject, semester, type, coefficient } = req.body;

    if (!courseName || !department || !subject || !semester || !type) {
      return res.status(400).json({ message: 'Tous les champs communs sont requis (courseName, department, subject, semester, type)' });
    }

    // Parse the Excel file from the buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ message: 'Le fichier Excel est vide' });
    }

    // Validate that required columns exist
    const firstRow = rows[0];
    if (!('studentId' in firstRow) || !('score' in firstRow)) {
      return res.status(400).json({ message: 'Le fichier doit contenir les colonnes "studentId" et "score"' });
    }

    const results = { created: 0, errors: [] };
    const gradesToCreate = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because row 1 is header, data starts at row 2
      const sid = String(row.studentId || '').trim();
      const score = Number(row.score);

      if (!sid) {
        results.errors.push({ row: rowNum, studentId: sid, reason: 'studentId manquant' });
        continue;
      }

      if (isNaN(score) || score < 0 || score > 20) {
        results.errors.push({ row: rowNum, studentId: sid, reason: `Score invalide: ${row.score} (doit être entre 0 et 20)` });
        continue;
      }

      // Look up the student by their studentId field
      const student = await User.findOne({ studentId: sid, role: 'STUDENT' });
      if (!student) {
        results.errors.push({ row: rowNum, studentId: sid, reason: 'Étudiant introuvable' });
        continue;
      }

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

    // Bulk insert valid grades
    if (gradesToCreate.length > 0) {
      await Grade.insertMany(gradesToCreate);
      results.created = gradesToCreate.length;
    }

    res.status(201).json(results);
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: error.message });
  }
};
