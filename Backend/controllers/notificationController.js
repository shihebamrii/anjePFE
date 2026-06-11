// Import Mongoose models to query notifications-related data from the database
import News from '../models/News.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Grade from '../models/Grade.js';
import Event from '../models/Event.js';
import Stage from '../models/Stage.js';
import Attendance from '../models/Attendance.js';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';

/**
 * Controller to fetch, aggregate, and sort notifications for the logged-in user
 * notifications are compiled dynamically based on the user's role and recent database records.
 */
export const getNotifications = async (req, res) => {
  try {
    // Get the logged-in user details attached to the request by the authMiddleware
    const user = req.user; 
    
    // Initialize an empty list to store all generated notifications
    let notifications = [];

    // --- Date Calculators ---
    
    // Date object representing exactly 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Date object representing exactly 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Current date/time
    const today = new Date();
    
    // Date object representing exactly 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // ═══════════════════════════════════════════════════════
    // COMMON NOTIFICATIONS (All roles can view these)
    // ═══════════════════════════════════════════════════════

    // 1. Recent News (Find news published in the last 7 days, limit to 5 most recent)
    const recentNews = await News.find({
      createdAt: { $gte: sevenDaysAgo },
      status: 'published'
    }).sort({ createdAt: -1 }).limit(5);

    // Format news items and push them to the notifications list
    recentNews.forEach(news => {
      notifications.push({
        id: `news_${news._id}`,
        title: 'Nouvelle Actualité', // "New Announcement"
        message: news.title,
        time: news.createdAt,
        type: news.type === 'urgent' ? 'warning' : 'info', // High priority or normal
      });
    });

    // 2. Upcoming Events (Find events starting between now and the next 3 days, limit to 5)
    const upcomingEvents = await Event.find({
      startDate: { $gte: today, $lte: threeDaysFromNow }
    }).sort({ startDate: 1 }).limit(5);

    // Format upcoming events and calculate how many days are left until they start
    upcomingEvents.forEach(event => {
      // Calculate difference in days between the event start date and today
      const daysUntil = Math.ceil((new Date(event.startDate) - today) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `event_upcoming_${event._id}`,
        title: 'Événement à venir', // "Upcoming Event"
        message: `${event.title} — ${daysUntil <= 0 ? "aujourd'hui" : `dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`}`,
        time: event.createdAt,
        type: daysUntil <= 1 ? 'warning' : 'info', // Mark as warning if starting today or tomorrow
      });
    });

    // 3. New Events (Find events added in the last 3 days that start further out than 3 days, limit to 3)
    const newEvents = await Event.find({
      createdAt: { $gte: threeDaysAgo },
      startDate: { $gt: threeDaysFromNow } // Exclude the upcoming ones already shown above
    }).sort({ createdAt: -1 }).limit(3);

    // Format new event alerts and push to notifications
    newEvents.forEach(event => {
      notifications.push({
        id: `event_new_${event._id}`,
        title: 'Nouvel Événement', // "New Event Created"
        message: `"${event.title}" a été ajouté au calendrier.`,
        time: event.createdAt,
        type: 'info',
      });
    });

    // 4. Recent Internship Offers (Find OPEN internship offers posted in the last 7 days, limit to 5)
    const recentStages = await Stage.find({
      status: 'OPEN',
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(5);

    // Format and push the new internship offers
    recentStages.forEach(stage => {
      notifications.push({
        id: `stage_${stage._id}`,
        title: 'Nouvelle offre de stage', // "New Internship Offer"
        message: `${stage.type} chez ${stage.companyName} — ${stage.location}`,
        time: stage.createdAt,
        type: 'info',
      });
    });

    // 5. Internship Deadlines (Find open offers closing within the next 3 days, limit to 3)
    const urgentStages = await Stage.find({
      status: 'OPEN',
      deadline: { $gte: today, $lte: threeDaysFromNow }
    }).sort({ deadline: 1 }).limit(3);

    // Format and push warning alerts for approaching internship application deadlines
    urgentStages.forEach(stage => {
      notifications.push({
        id: `stage_deadline_${stage._id}`,
        title: 'Date limite de stage', // "Internship Deadline Approaching"
        message: `L'offre "${stage.title}" chez ${stage.companyName} expire bientôt !`,
        time: stage.updatedAt || stage.createdAt,
        type: 'warning',
      });
    });

    // 6. Recent Chat Messages (Find messages received in the last 24 hours from other users)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentMessages = await Message.find({
      createdAt: { $gte: oneDayAgo },
      sender: { $ne: user._id } // Do not include messages sent by the logged-in user
    }).sort({ createdAt: -1 }).limit(5);

    // If there are unread/new messages, add a single summary notification
    if (recentMessages.length > 0) {
      notifications.push({
        id: `chat_${recentMessages[0]._id}`,
        title: 'Nouveaux messages', // "New Messages"
        message: `Vous avez ${recentMessages.length} nouveau${recentMessages.length > 1 ? 'x' : ''} message${recentMessages.length > 1 ? 's' : ''} dans le chat.`,
        time: recentMessages[0].createdAt,
        type: 'info',
      });
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN & DEPARTMENT HEAD (CHEF_DEPT) NOTIFICATIONS
    // ═══════════════════════════════════════════════════════

    if (user.role === 'ADMIN' || user.role === 'CHEF_DEPT') {
      
      // 7. Pending Complaints (Find all complaints waiting for review, limit to 5)
      const pendingComplaints = await Complaint.find({ status: 'PENDING' }).sort({ createdAt: -1 }).limit(5);
      pendingComplaints.forEach(comp => {
        notifications.push({
          id: `comp_pending_${comp._id}`,
          title: 'Réclamation en attente', // "Pending Complaint"
          message: 'Une nouvelle réclamation nécessite votre attention.',
          time: comp.createdAt,
          type: 'warning',
        });
      });

      // 8. Pending Users (Find inactive accounts awaiting activation by admins, limit to 5)
      const pendingUsers = await User.find({ isActive: false }).sort({ createdAt: -1 }).limit(5);
      pendingUsers.forEach(u => {
        notifications.push({
          id: `user_pending_${u._id}`,
          title: 'Utilisateur en attente', // "User Pending Activation"
          message: `${u.firstName} ${u.lastName} attend l'activation de son compte.`,
          time: u.createdAt,
          type: 'warning',
        });
      });

      // 9. New User Registrations (Find active users who joined in the last 7 days, limit to 5)
      const newUsers = await User.find({
        createdAt: { $gte: sevenDaysAgo },
        isActive: true
      }).sort({ createdAt: -1 }).limit(5);

      newUsers.forEach(u => {
        notifications.push({
          id: `user_new_${u._id}`,
          title: 'Nouvel utilisateur', // "New User Joined"
          message: `${u.firstName} ${u.lastName} (${u.role}) a rejoint la plateforme.`,
          time: u.createdAt,
          type: 'success',
        });
      });

      // 10. Recently Resolved Complaints (Find complaints accepted/rejected in the last 3 days, limit to 5)
      const resolvedComplaints = await Complaint.find({
        status: { $in: ['ACCEPTED', 'REJECTED'] },
        updatedAt: { $gte: threeDaysAgo }
      }).sort({ updatedAt: -1 }).limit(5);

      resolvedComplaints.forEach(comp => {
        notifications.push({
          id: `comp_resolved_${comp._id}`,
          title: `Réclamation ${comp.status === 'ACCEPTED' ? 'acceptée' : 'rejetée'}`, // "Complaint Accepted/Rejected"
          message: `Une réclamation a été ${comp.status === 'ACCEPTED' ? 'acceptée' : 'rejetée'}.`,
          time: comp.updatedAt,
          type: comp.status === 'ACCEPTED' ? 'success' : 'info',
        });
      });

      // 11. Department Updates (Find departments updated in the last 7 days, limit to 3)
      const recentDepts = await Department.find({
        updatedAt: { $gte: sevenDaysAgo }
      }).sort({ updatedAt: -1 }).limit(3);

      recentDepts.forEach(dept => {
        notifications.push({
          id: `dept_update_${dept._id}`,
          title: 'Département mis à jour', // "Department Updated"
          message: `Le département "${dept.name}" a été modifié.`,
          time: dept.updatedAt,
          type: 'info',
        });
      });
    }

    // ═══════════════════════════════════════════════════════
    // TEACHER NOTIFICATIONS
    // ═══════════════════════════════════════════════════════

    if (user.role === 'TEACHER' || user.role === 'CHEF_DEPT') {
      
      // 12. Complaints on Grades (Find pending complaints created in the last 7 days)
      const teacherComplaints = await Complaint.find({
        status: 'PENDING',
        createdAt: { $gte: sevenDaysAgo }
      }).populate('grade').sort({ createdAt: -1 }).limit(5);

      // Filter and only notify the teacher if they were the one who gave the graded subject
      for (const comp of teacherComplaints) {
        if (comp.grade && comp.grade.teacher && comp.grade.teacher.toString() === user._id.toString()) {
          notifications.push({
            id: `teacher_comp_${comp._id}`,
            title: 'Réclamation sur votre note', // "Grade Contest Alert"
            message: `Un étudiant a contesté une note en ${comp.grade.subject}.`,
            time: comp.createdAt,
            type: 'warning',
          });
        }
      }

      // 13. Recent Attendance (Find attendance registers taken by this teacher in the last 3 days)
      const recentAttendance = await Attendance.find({
        teacher: user._id,
        createdAt: { $gte: threeDaysAgo }
      }).sort({ createdAt: -1 }).limit(1);

      // Count the total attendance registers taken by the teacher in the last 3 days
      if (recentAttendance.length > 0) {
        const totalRecorded = await Attendance.countDocuments({
          teacher: user._id,
          createdAt: { $gte: threeDaysAgo }
        });
        notifications.push({
          id: `attendance_teacher_${recentAttendance[0]._id}`,
          title: 'Présence enregistrée', // "Attendance Logged"
          message: `${totalRecorded} présence${totalRecorded > 1 ? 's' : ''} enregistrée${totalRecorded > 1 ? 's' : ''} ces derniers jours.`,
          time: recentAttendance[0].createdAt,
          type: 'success',
        });
      }

      // 14. Teacher's own complaints (If the teacher filed a complaint as a user, get resolved ones in last 7 days)
      const teacherResolvedComps = await Complaint.find({
        student: user._id,
        status: { $in: ['ACCEPTED', 'REJECTED'] },
        updatedAt: { $gte: sevenDaysAgo }
      }).sort({ updatedAt: -1 }).limit(3);

      teacherResolvedComps.forEach(comp => {
        notifications.push({
          id: `comp_own_${comp._id}`,
          title: `Réclamation ${comp.status === 'ACCEPTED' ? 'Acceptée' : 'Rejetée'}`,
          message: `Votre réclamation a été traitée.`,
          time: comp.updatedAt,
          type: comp.status === 'ACCEPTED' ? 'success' : 'info',
        });
      });
    }

    // ═══════════════════════════════════════════════════════
    // STUDENT NOTIFICATIONS
    // ═══════════════════════════════════════════════════════

    if (user.role === 'STUDENT') {
      
      // 15. New Grades (Find grades published for this student in the last 7 days, limit to 5)
      const recentGrades = await Grade.find({
        student: user._id,
        createdAt: { $gte: sevenDaysAgo }
      }).sort({ createdAt: -1 }).limit(5);

      recentGrades.forEach(grade => {
        notifications.push({
          id: `grade_${grade._id}`,
          title: 'Nouvelle Note', // "New Grade Published"
          message: `${grade.subject} (${grade.type}) : ${grade.score}/20`,
          time: grade.createdAt,
          type: 'success',
        });
      });

      // 16. Absences/Latenesses (Find absences or latenesses recorded for this student in the last 7 days, limit to 5)
      const recentAbsences = await Attendance.find({
        student: user._id,
        status: { $in: ['ABSENT', 'LATE'] },
        createdAt: { $gte: sevenDaysAgo }
      }).sort({ createdAt: -1 }).limit(5);

      recentAbsences.forEach(att => {
        notifications.push({
          id: `absence_${att._id}`,
          title: att.status === 'ABSENT' ? 'Absence enregistrée' : 'Retard enregistré', // "Absence/Lateness Registered"
          message: `${att.status === 'ABSENT' ? 'Absence' : 'Retard'} en ${att.courseName} le ${new Date(att.date).toLocaleDateString('fr-FR')}.`,
          time: att.createdAt,
          type: 'warning',
        });
      });

      // 17. Complaint Resolutions (Find student's complaints resolved in the last 7 days, limit to 5)
      const studentComplaints = await Complaint.find({
        student: user._id,
        status: { $in: ['ACCEPTED', 'REJECTED'] },
        updatedAt: { $gte: sevenDaysAgo }
      }).sort({ updatedAt: -1 }).limit(5);

      studentComplaints.forEach(comp => {
        notifications.push({
          id: `comp_student_${comp._id}`,
          title: `Réclamation ${comp.status === 'ACCEPTED' ? 'Acceptée' : 'Rejetée'}`, // "Complaint Decided"
          message: `Votre réclamation a été ${comp.status === 'ACCEPTED' ? 'acceptée ✓' : 'rejetée ✗'}.`,
          time: comp.updatedAt,
          type: comp.status === 'ACCEPTED' ? 'success' : 'warning',
        });
      });

      // 18. Pending Student Complaints (Find active complaints of this student currently in PENDING state)
      const myPendingComplaints = await Complaint.find({
        student: user._id,
        status: 'PENDING'
      }).sort({ createdAt: -1 }).limit(3);

      myPendingComplaints.forEach(comp => {
        notifications.push({
          id: `comp_mypending_${comp._id}`,
          title: 'Réclamation en cours', // "Complaint Under Review"
          message: 'Votre réclamation est en cours de traitement.',
          time: comp.createdAt,
          type: 'info',
        });
      });

      // 19. Excused Absences (Find absences that were excused by administration in the last 7 days)
      const excusedAbsences = await Attendance.find({
        student: user._id,
        status: 'EXCUSED',
        updatedAt: { $gte: sevenDaysAgo }
      }).sort({ updatedAt: -1 }).limit(3);

      excusedAbsences.forEach(att => {
        notifications.push({
          id: `excused_${att._id}`,
          title: 'Absence justifiée', // "Absence Excused/Justified"
          message: `Votre absence en ${att.courseName} a été justifiée.`,
          time: att.updatedAt,
          type: 'success',
        });
      });

      // 20. Total Absence Warning (Count how many unexcused absences the student has)
      const totalAbsences = await Attendance.countDocuments({
        student: user._id,
        status: 'ABSENT',
        justified: false
      });

      // If the student has accumulated 3 or more unexcused absences, add a critical warning notification
      if (totalAbsences >= 3) {
        notifications.push({
          id: `absence_warning_${user._id}`,
          title: '⚠️ Alerte Absences', // "Absence Warning Alert"
          message: `Vous avez ${totalAbsences} absence${totalAbsences > 1 ? 's' : ''} non justifiée${totalAbsences > 1 ? 's' : ''}. Veuillez régulariser votre situation.`,
          time: new Date(),
          type: 'warning',
        });
      }
    }

    // ═══════════════════════════════════════════════════════
    // PARTNER NOTIFICATIONS
    // ═══════════════════════════════════════════════════════

    if (user.role === 'PARTNER') {
      
      // 21. Partner's Internship Posts (Find stages posted by this partner in the last 7 days, limit to 5)
      const partnerStages = await Stage.find({
        postedBy: user._id,
        createdAt: { $gte: sevenDaysAgo }
      }).sort({ createdAt: -1 }).limit(5);

      partnerStages.forEach(stage => {
        notifications.push({
          id: `partner_stage_${stage._id}`,
          title: 'Offre de stage publiée', // "Internship Post Published"
          message: `Votre offre "${stage.title}" est maintenant visible.`,
          time: stage.createdAt,
          type: 'success',
        });
      });

      // 22. Partner stages closing soon (Find posts closing within the next 3 days, limit to 3)
      const partnerClosingStages = await Stage.find({
        postedBy: user._id,
        status: 'OPEN',
        deadline: { $gte: today, $lte: threeDaysFromNow }
      }).sort({ deadline: 1 }).limit(3);

      partnerClosingStages.forEach(stage => {
        notifications.push({
          id: `partner_deadline_${stage._id}`,
          title: 'Date limite proche', // "Deadline Nearing"
          message: `L'offre "${stage.title}" expire bientôt. Pensez à la prolonger ou la clôturer.`,
          time: stage.updatedAt || stage.createdAt,
          type: 'warning',
        });
      });
    }

    // Sort all aggregated notifications by time descending (newest first)
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Respond with status 200 and the list of notifications as JSON
    res.status(200).json(notifications);
  } catch (error) {
    // If an error occurs, respond with status 500 and the error details
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: error.message });
  }
};
