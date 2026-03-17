import Message from '../models/Message.js';
import Department from '../models/Department.js';
import Session from '../models/Session.js';

// @desc    Get chat history for a specific room
// @route   GET /api/chat/history/:room
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'firstName lastName avatar');
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique' });
  }
};

// @desc    Get available chat rooms for the current user
// @route   GET /api/chat/rooms
// @access  Private
export const getMyRooms = async (req, res) => {
  try {
    const { role, classId, firstName, lastName } = req.user;
    const rooms = [];

    // All students and staff can access general chat
    rooms.push({ id: 'general', name: 'Chat Général', type: 'GENERAL' });

    if (role === 'STUDENT' && classId) {
      rooms.push({ id: `class_${classId}`, name: `Ma Classe (${req.user.className || 'N/A'})`, type: 'CLASS' });
    }

    if (role === 'TEACHER') {
      // Find all classes this teacher teaches
      const teacherNameRegex = new RegExp(`(?=.*${firstName})(?=.*${lastName})`, 'i');
      const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } });
      
      const classMap = new Map();
      sessions.forEach(s => {
        if (s.classId) {
          classMap.set(s.classId.toString(), s.className || 'Classe inconnue');
        }
      });

      classMap.forEach((name, id) => {
        rooms.push({ id: `class_${id}`, name: `Classe: ${name}`, type: 'CLASS' });
      });
    }

    if (role === 'CHEF_DEPT') {
        const dept = await Department.findOne({ headEmail: req.user.email.toLowerCase() });
        if (dept) {
            dept.classes.forEach(c => {
                rooms.push({ id: `class_${c.externalId || c._id}`, name: `Classe: ${c.name}`, type: 'CLASS' });
            });
        }
    }

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des salons' });
  }
};
