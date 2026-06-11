import Complaint from '../models/Complaint.js'; // Import Complaint database model
import Grade from '../models/Grade.js'; // Import Grade database model

// @desc    Create a complaint on a grade
// @route   POST /api/complaints
// @access  Private/Student
export const createComplaint = async (req, res) => {
  try {
    const { gradeId, reason } = req.body; // Extract target grade ID and explanation reason from request

    if (!gradeId || !reason) {
      // Validate that gradeId and reason are provided
      return res.status(400).json({ message: 'gradeId et reason sont requis' });
    }

    // Verify that the requested grade actually exists in the database
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Note introuvable' });
    }
    
    // Verify that the grade belongs to the currently authenticated student
    if (grade.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez réclamer que vos propres notes' });
    }

    // Check if the student has already filed a complaint for this specific grade
    const existing = await Complaint.findOne({ student: req.user._id, grade: gradeId });
    if (existing) {
      return res.status(400).json({ message: 'Une réclamation existe déjà pour cette note' });
    }

    // Construct a new Complaint instance
    const complaint = new Complaint({
      student: req.user._id,
      grade: gradeId,
      reason,
    });

    // Save complaint document in the database
    const created = await complaint.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private (Student sees own, Chef/Admin sees all)
export const getComplaints = async (req, res) => {
  try {
    let query = {}; // Initialize filter query object

    // If student, filter results to only display their own complaints
    if (req.user.role === 'STUDENT') {
      query.student = req.user._id;
    }
    // Note: CHEF_DEPT and ADMIN do not get filtered, allowing them to view all complaints

    // Fetch complaints matching search criteria, populate associated documents, and sort newest first
    const complaints = await Complaint.find(query)
      .populate('student', 'firstName lastName studentId email department')
      .populate({
        path: 'grade',
        select: 'courseName subject score type semester department date',
        populate: { path: 'teacher', select: 'firstName lastName' }, // Nested populate for teacher name
      })
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve a complaint (accept or reject)
// @route   PUT /api/complaints/:id/resolve
// @access  Private/Chef/Admin
export const resolveComplaint = async (req, res) => {
  try {
    const { status, response } = req.body; // Extract resolution status and response feedback text

    // Validate that status parameter matches either ACCEPTED or REJECTED
    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'status doit être ACCEPTED ou REJECTED' });
    }

    // Locate targeted complaint by ID parameter
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Réclamation introuvable' });
    }

    // Ensure the complaint has not been processed already
    if (complaint.status !== 'PENDING') {
      return res.status(400).json({ message: 'Cette réclamation a déjà été traitée' });
    }

    // Apply resolution update values
    complaint.status = status;
    complaint.response = response || '';
    complaint.resolvedBy = req.user._id; // Log which administrator resolved the issue
    complaint.resolvedAt = new Date(); // Timestamp resolution date

    // Save modifications to database
    const updated = await complaint.save();

    // Re-populate details on the updated document to return complete data objects to client
    await updated.populate('student', 'firstName lastName studentId email department');
    await updated.populate({
      path: 'grade',
      select: 'courseName subject score type semester department date',
      populate: { path: 'teacher', select: 'firstName lastName' },
    });
    await updated.populate('resolvedBy', 'firstName lastName');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
