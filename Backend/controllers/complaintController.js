import Complaint from '../models/Complaint.js';
import Grade from '../models/Grade.js';

// @desc    Create a complaint on a grade
// @route   POST /api/complaints
// @access  Private/Student
export const createComplaint = async (req, res) => {
  try {
    const { gradeId, reason } = req.body;

    if (!gradeId || !reason) {
      return res.status(400).json({ message: 'gradeId et reason sont requis' });
    }

    // Verify the grade exists and belongs to this student
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Note introuvable' });
    }
    if (grade.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez réclamer que vos propres notes' });
    }

    // Check if a complaint already exists for this grade by this student
    const existing = await Complaint.findOne({ student: req.user._id, grade: gradeId });
    if (existing) {
      return res.status(400).json({ message: 'Une réclamation existe déjà pour cette note' });
    }

    const complaint = new Complaint({
      student: req.user._id,
      grade: gradeId,
      reason,
    });

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
    let query = {};

    if (req.user.role === 'STUDENT') {
      query.student = req.user._id;
    }
    // CHEF_DEPT and ADMIN see all complaints

    const complaints = await Complaint.find(query)
      .populate('student', 'firstName lastName studentId email department')
      .populate({
        path: 'grade',
        select: 'courseName subject score type semester department date',
        populate: { path: 'teacher', select: 'firstName lastName' },
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
    const { status, response } = req.body;

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'status doit être ACCEPTED ou REJECTED' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Réclamation introuvable' });
    }

    if (complaint.status !== 'PENDING') {
      return res.status(400).json({ message: 'Cette réclamation a déjà été traitée' });
    }

    complaint.status = status;
    complaint.response = response || '';
    complaint.resolvedBy = req.user._id;
    complaint.resolvedAt = new Date();

    const updated = await complaint.save();

    // Re-populate for the response
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
