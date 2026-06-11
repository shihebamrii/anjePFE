import Message from '../models/Message.js'; // Import Message database model
import Department from '../models/Department.js'; // Import Department database model
import Session from '../models/Session.js'; // Import Session database model

// @desc    Get chat history for a specific room
// @route   GET /api/chat/history/:room
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { room } = req.params; // Extract room ID from request route parameter

    // Find the latest 50 messages sent in this room and populate details of sender
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50) // Limit to the last 50 entries
      .populate('sender', 'firstName lastName avatar'); // Fetch sender details
    
    // Reverse the list back to chronological order (oldest to newest) before returning to client
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
    const { role, classId, firstName, lastName } = req.user; // Extract current user profile details
    const rooms = []; // Initialize empty array to collect accessible channels

    // All students and staff can access the general institutional chat room
    rooms.push({ id: 'general', name: 'Chat Général', type: 'GENERAL' });

    // If student, grant access to their class-specific group room
    if (role === 'STUDENT' && classId) {
      rooms.push({ id: `class_${classId}`, name: `Ma Classe (${req.user.className || 'N/A'})`, type: 'CLASS' });
    }

    // If teacher, resolve all classes they teach based on scheduled sessions
    if (role === 'TEACHER') {
      // Create case-insensitive regex to match teacher's name across scheduled classes
      const teacherNameRegex = new RegExp(`(?=.*${firstName})(?=.*${lastName})`, 'i');
      const sessions = await Session.find({ 'teacher.name': { $regex: teacherNameRegex } });
      
      // Deduplicate class rooms using a map
      const classMap = new Map();
      sessions.forEach(s => {
        if (s.classId) {
          classMap.set(s.classId.toString(), s.className || 'Classe inconnue');
        }
      });

      // Insert resolved class channels into the rooms list
      classMap.forEach((name, id) => {
        rooms.push({ id: `class_${id}`, name: `Classe: ${name}`, type: 'CLASS' });
      });
    }

    // If department head, grant access to all classes managed by their department
    if (role === 'CHEF_DEPT') {
        const dept = await Department.findOne({ headEmail: req.user.email.toLowerCase() });
        if (dept) {
            dept.classes.forEach(c => {
                rooms.push({ id: `class_${c.externalId || c._id}`, name: `Classe: ${c.name}`, type: 'CLASS' });
            });
        }
    }

    res.json(rooms); // Return the list of accessible channels
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des salons' });
  }
};
