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

export const getNotifications = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware
    let notifications = [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // ═══════════════════════════════════════════════════════
    // COMMON NOTIFICATIONS (All roles)
    // ═══════════════════════════════════════════════════════

    // 1. Recent News (last 7 days)
    const recentNews = await News.find({
      createdAt: { $gte: sevenDaysAgo },
      status: 'published'
    }).sort({ createdAt: -1 }).limit(5);

    recentNews.forEach(news => {
      notifications.push({
        id: `news_${news._id}`,
        title: 'Nouvelle Actualité',
        message: news.title,
        time: news.createdAt,
        type: news.type === 'urgent' ? 'warning' : 'info',
      });
    });

    // 2. Upcoming Events (within next 3 days)
    const upcomingEvents = await Event.find({
      startDate: { $gte: today, $lte: threeDaysFromNow }
    }).sort({ startDate: 1 }).limit(5);

    upcomingEvents.forEach(event => {
      const daysUntil = Math.ceil((new Date(event.startDate) - today) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `event_upcoming_${event._id}`,
        title: 'Événement à venir',
        message: `${event.title} — ${daysUntil <= 0 ? "aujourd'hui" : `dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`}`,
        time: event.createdAt,
        type: daysUntil <= 1 ? 'warning' : 'info',
      });
    });

    // 3. New Events created recently (last 3 days)
    const newEvents = await Event.find({
      createdAt: { $gte: threeDaysAgo },
      startDate: { $gt: threeDaysFromNow } // exclude the ones already shown above
    }).sort({ createdAt: -1 }).limit(3);

    newEvents.forEach(event => {
      notifications.push({
        id: `event_new_${event._id}`,
        title: 'Nouvel Événement',
        message: `"${event.title}" a été ajouté au calendrier.`,
        time: event.createdAt,
        type: 'info',
      });
    });

    // 4. New Internship Offers (last 7 days, all roles can see)
    const recentStages = await Stage.find({
      status: 'OPEN',
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(5);

    recentStages.forEach(stage => {
      notifications.push({
        id: `stage_${stage._id}`,
        title: 'Nouvelle offre de stage',
        message: `${stage.type} chez ${stage.companyName} — ${stage.location}`,
        time: stage.createdAt,
        type: 'info',
      });
    });

    // 5. Stage deadlines approaching (within 3 days)
    const urgentStages = await Stage.find({
      status: 'OPEN',
      deadline: { $gte: today, $lte: threeDaysFromNow }
    }).sort({ deadline: 1 }).limit(3);

    urgentStages.forEach(stage => {
      notifications.push({
        id: `stage_deadline_${stage._id}`,
        title: 'Date limite de stage',
        message: `L'offre "${stage.title}" chez ${stage.companyName} expire bientôt !`,
        time: stage.updatedAt || stage.createdAt,
        type: 'warning',
      });
    });

    // 6. Recent Chat Messages (last 24 hours, unread indicator)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentMessages = await Message.find({
      createdAt: { $gte: oneDayAgo },
      sender: { $ne: user._id }
    }).sort({ createdAt: -1 }).limit(5);

    if (recentMessages.length > 0) {
      notifications.push({
        id: `chat_${recentMessages[0]._id}`,
        title: 'Nouveaux messages',
        message: `Vous avez ${recentMessages.length} nouveau${recentMessages.length > 1 ? 'x' : ''} message${recentMessages.length > 1 ? 's' : ''} dans le chat.`,
        time: recentMessages[0].createdAt,
        type: 'info',
      });
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN & CHEF_DEPT NOTIFICATIONS
    // ═══════════════════════════════════════════════════════

    if (user.role === 'ADMIN' || user.role === 'CHEF_DEPT') {
      // 7. Pending Complaints
      const pendingComplaints = await Complaint.find({ status: 'PENDING' }).sort({ createdAt: -1 }).limit(5);
      pendingComplaints.forEach(comp => {
        notifications.push({
          id: `comp_pending_${comp._id}`,
          title: 'Réclamation en attente',
          message: 'Une nouvelle réclamation nécessite votre attention.',
          time: comp.createdAt,
          type: 'warning',
        });
      });

      // 8. Pending Users (inactive users awaiting activation)
      const pendingUsers = await User.find({ isActive: false }).sort({ createdAt: -1 }).limit(5);
      pendingUsers.forEach(u => {
        notifications.push({
          id: `user_pending_${u._id}`,
          title: 'Utilisateur en attente',
          message: `${u.firstName} ${u.lastName} attend l'activation de son compte.`,
          time: u.createdAt,
          type: 'warning',
        });
      });

      // 9. New User Registrations (last 7 days)
      const newUsers = await User.find({
        createdAt: { $gte: sevenDaysAgo },
        isActive: true
      }).sort({ createdAt: -1 }).limit(5);

      newUsers.forEach(u => {
        notifications.push({
          id: `user_new_${u._id}`,
          title: 'Nouvel utilisateur',
          message: `${u.firstName} ${u.lastName} (${u.role}) a rejoint la plateforme.`,
          time: u.createdAt,
          type: 'success',
        });
      });

      // 10. Recently Resolved Complaints (last 3 days)
      const resolvedComplaints = await Complaint.find({
        status: { $in: ['ACCEPTED', 'REJECTED'] },
        updatedAt: { $gte: threeDaysAgo }
      }).sort({ updatedAt: -1 }).limit(5);

      resolvedComplaints.forEach(comp => {
        notifications.push({
          id: `comp_resolved_${comp._id}`,
          title: `Réclamation ${comp.status === 'ACCEPTED' ? 'acceptée' : 'rejetée'}`,
          message: `Une réclamation a été ${comp.status === 'ACCEPTED' ? 'acceptée' : 'rejetée'}.`,
          time: comp.updatedAt,
          type: comp.status === 'ACCEPTED' ? 'success' : 'info',
        });
      });

      // 11. Department updates (new teachers/classes added recently)
      const recentDepts = await Department.find({
        updatedAt: { $gte: sevenDaysAgo }
      }).sort({ updatedAt: -1 }).limit(3);

      recentDepts.forEach(dept => {
        notifications.push({
          id: `dept_update_${dept._id}`,
          title: 'Département mis à jour',
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
      // 12. Complaints on grades the teacher may be involved with
      const teacherComplaints = await Complaint.find({
        status: 'PENDING',
        createdAt: { $gte: sevenDaysAgo }
      }).populate('grade').sort({ createdAt: -1 }).limit(5);

      for (const comp of teacherComplaints) {
        if (comp.grade && comp.grade.teacher && comp.grade.teacher.toString() === user._id.toString()) {
          notifications.push({
            id: `teacher_comp_${comp._id}`,
            title: 'Réclamation sur votre note',
            message: `Un étudiant a contesté une note en ${comp.grade.subject}.`,
            time: comp.createdAt,
            type: 'warning',
          });
        }
      }

      // 13. Recent Attendance sessions recorded by this teacher
      const recentAttendance = await Attendance.find({
        teacher: user._id,
        createdAt: { $gte: threeDaysAgo }
      }).sort({ createdAt: -1 }).limit(1);

      if (recentAttendance.length > 0) {
        const totalRecorded = await Attendance.countDocuments({
          teacher: user._id,
          createdAt: { $gte: threeDaysAgo }
        });
        notifications.push({
          id: `attendance_teacher_${recentAttendance[0]._id}`,
          title: 'Présence enregistrée',
          message: `${totalRecorded} présence${totalRecorded > 1 ? 's' : ''} enregistrée${totalRecorded > 1 ? 's' : ''} ces derniers jours.`,
          time: recentAttendance[0].createdAt,
          type: 'success',
        });
      }

      // 14. Teacher's own resolved complaints (if they filed one)
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
      // 15. New Grades
      const recentGrades = await Grade.find({
        student: user._id,
        createdAt: { $gte: sevenDaysAgo }
      }).sort({ createdAt: -1 }).limit(5);

      recentGrades.forEach(grade => {
        notifications.push({
          id: `grade_${grade._id}`,
          title: 'Nouvelle Note',
          message: `${grade.subject} (${grade.type}) : ${grade.score}/20`,
          time: grade.createdAt,
          type: 'success',
        });
      });

      // 16. Absences recorded recently
      const recentAbsences = await Attendance.find({
        student: user._id,
        status: { $in: ['ABSENT', 'LATE'] },
        createdAt: { $gte: sevenDaysAgo }
      }).sort({ createdAt: -1 }).limit(5);

      recentAbsences.forEach(att => {
        notifications.push({
          id: `absence_${att._id}`,
          title: att.status === 'ABSENT' ? 'Absence enregistrée' : 'Retard enregistré',
          message: `${att.status === 'ABSENT' ? 'Absence' : 'Retard'} en ${att.courseName} le ${new Date(att.date).toLocaleDateString('fr-FR')}.`,
          time: att.createdAt,
          type: 'warning',
        });
      });

      // 17. Complaint status updates
      const studentComplaints = await Complaint.find({
        student: user._id,
        status: { $in: ['ACCEPTED', 'REJECTED'] },
        updatedAt: { $gte: sevenDaysAgo }
      }).sort({ updatedAt: -1 }).limit(5);

      studentComplaints.forEach(comp => {
        notifications.push({
          id: `comp_student_${comp._id}`,
          title: `Réclamation ${comp.status === 'ACCEPTED' ? 'Acceptée' : 'Rejetée'}`,
          message: `Votre réclamation a été ${comp.status === 'ACCEPTED' ? 'acceptée ✓' : 'rejetée ✗'}.`,
          time: comp.updatedAt,
          type: comp.status === 'ACCEPTED' ? 'success' : 'warning',
        });
      });

      // 18. Pending complaints (submitted by student)
      const myPendingComplaints = await Complaint.find({
        student: user._id,
        status: 'PENDING'
      }).sort({ createdAt: -1 }).limit(3);

      myPendingComplaints.forEach(comp => {
        notifications.push({
          id: `comp_mypending_${comp._id}`,
          title: 'Réclamation en cours',
          message: 'Votre réclamation est en cours de traitement.',
          time: comp.createdAt,
          type: 'info',
        });
      });

      // 19. Excused absences (good news)
      const excusedAbsences = await Attendance.find({
        student: user._id,
        status: 'EXCUSED',
        updatedAt: { $gte: sevenDaysAgo }
      }).sort({ updatedAt: -1 }).limit(3);

      excusedAbsences.forEach(att => {
        notifications.push({
          id: `excused_${att._id}`,
          title: 'Absence justifiée',
          message: `Votre absence en ${att.courseName} a été justifiée.`,
          time: att.updatedAt,
          type: 'success',
        });
      });

      // 20. Total absence warning
      const totalAbsences = await Attendance.countDocuments({
        student: user._id,
        status: 'ABSENT',
        justified: false
      });

      if (totalAbsences >= 3) {
        notifications.push({
          id: `absence_warning_${user._id}`,
          title: '⚠️ Alerte Absences',
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
      // 21. Partner's own internship posts
      const partnerStages = await Stage.find({
        postedBy: user._id,
        createdAt: { $gte: sevenDaysAgo }
      }).sort({ createdAt: -1 }).limit(5);

      partnerStages.forEach(stage => {
        notifications.push({
          id: `partner_stage_${stage._id}`,
          title: 'Offre de stage publiée',
          message: `Votre offre "${stage.title}" est maintenant visible.`,
          time: stage.createdAt,
          type: 'success',
        });
      });

      // 22. Partner stages closing soon
      const partnerClosingStages = await Stage.find({
        postedBy: user._id,
        status: 'OPEN',
        deadline: { $gte: today, $lte: threeDaysFromNow }
      }).sort({ deadline: 1 }).limit(3);

      partnerClosingStages.forEach(stage => {
        notifications.push({
          id: `partner_deadline_${stage._id}`,
          title: 'Date limite proche',
          message: `L'offre "${stage.title}" expire bientôt. Pensez à la prolonger ou la clôturer.`,
          time: stage.updatedAt || stage.createdAt,
          type: 'warning',
        });
      });
    }

    // Sort all notifications by time descending
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: error.message });
  }
};
