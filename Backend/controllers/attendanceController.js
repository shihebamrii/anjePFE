import Attendance from '../models/Attendance.js'; // Import Attendance database model
import User from '../models/User.js'; // Import User database model

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendance = async (req, res) => {
  try {
    const { studentId, date } = req.query; // Extract optional search parameters from request query
    let query = {}; // Initialize empty query filter object

    // Apply filters depending on the logged-in user's role
    if (req.user.role === 'STUDENT') {
      // Students can only view their own attendance records
      query.student = req.user._id;
    } else if (req.user.role === 'TEACHER') {
      // Teachers view attendance they recorded, optionally filtering by student ID
      query.teacher = req.user._id;
      if (studentId) query.student = studentId;
    } else if (studentId) {
      // Admins/others can view records filtered by a target student ID
      query.student = studentId;
    }

    // Filter by specific day if provided in request parameters
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0); // Start boundary: 00:00:00.000
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999); // End boundary: 23:59:59.999
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Execute query in MongoDB, populate teacher & student descriptions, sort from newest to oldest
    const attendanceRecords = await Attendance.find(query)
      .populate('teacher', 'firstName lastName')
      .populate('student', 'firstName lastName studentId registrationNumber className')
      .sort({ date: -1 });
      
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance (single)
// @route   POST /api/attendance
// @access  Private/Teacher/Admin
export const markAttendance = async (req, res) => {
  try {
    const { student, courseName, date, durationHours, status, sessionType, justification, justified } = req.body;

    // Create a new attendance document, automatically binding it to the current teacher ID
    const attendance = new Attendance({
      student,
      teacher: req.user._id,
      courseName,
      date,
      durationHours,
      status,
      sessionType,
      justification,
      justified
    });

    // Save attendance to database
    const createdAttendance = await attendance.save();
    res.status(201).json(createdAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk mark attendance for a whole class session
// @route   POST /api/attendance/bulk
// @access  Private/Teacher/Admin
export const markBulkAttendance = async (req, res) => {
  try {
    const { courseName, date, durationHours, sessionType, records } = req.body;

    // Validate request parameters and ensure class records list is provided
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Aucun enregistrement fourni.' });
    }
    if (!courseName || !date) {
      return res.status(400).json({ message: 'Cours et date sont requis.' });
    }

    // Map through array to construct individual Mongoose documents for bulk write operations
    const docs = records.map(r => ({
      student: r.student,
      teacher: req.user._id,
      courseName,
      date: new Date(date),
      durationHours: Number(durationHours) || 1.5,
      status: r.status || 'PRESENT',
      sessionType: sessionType || 'COURS',
    }));

    // Bulk insert multiple attendance sheets at once
    const created = await Attendance.insertMany(docs);
    res.status(201).json({ message: `${created.length} enregistrements créés.`, count: created.length });
  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students for a specific class
// @route   GET /api/attendance/students-by-class?className=...
// @access  Private/Teacher
export const getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.query; // Extract className from target query
    if (!className) {
      return res.status(400).json({ message: 'className est requis.' });
    }

    // Retrieve active student documents enrolled in this class section, sorted alphabetically
    const students = await User.find({ role: 'STUDENT', className })
      .select('firstName lastName email registrationNumber className')
      .sort({ lastName: 1, firstName: 1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update attendance status
// @route   PUT /api/attendance/:id
// @access  Private/Admin/Teacher
export const updateAttendance = async (req, res) => {
  try {
    const { status, justification, justified } = req.body;
    
    // Find the targeted attendance document
    const attendance = await Attendance.findById(req.params.id);

    if (attendance) {
      // Conditionally update properties if present in request payload
      if (status) attendance.status = status;
      if (justification !== undefined) attendance.justification = justification;
      if (justified !== undefined) attendance.justified = justified;

      // Save modification edits
      const updatedAttendance = await attendance.save();
      res.json(updatedAttendance);
    } else {
      res.status(404).json({ message: 'Attendance record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private/Teacher/Admin
export const deleteAttendance = async (req, res) => {
  try {
    // Find attendance record by ID parameter
    const attendance = await Attendance.findById(req.params.id);

    if (attendance) {
      // Perform database deletion
      await Attendance.deleteOne({ _id: attendance._id });
      res.json({ message: 'Attendance record removed' });
    } else {
      res.status(404).json({ message: 'Attendance record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
