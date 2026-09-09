const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

async function logActivity(userId, userName, role, action, module, req) {
  try {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    await query(
      `INSERT INTO activity_logs (user_id, user_name, role, action, module, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userName, role, action, module, ip]
    );
  } catch (err) {}
}

// Recalculate Student Stats (Events, Volunteer Hours, Attendance %)
async function recalculateStudentStats(studentId) {
  try {
    // Total Registered Events
    const regRes = await query(`SELECT COUNT(*) as total FROM event_registrations WHERE student_id = ?`, [studentId]);
    const totalReg = regRes[0].total || 0;

    // Total Present Attendance
    const presRes = await query(`SELECT COUNT(*) as present FROM attendance WHERE student_id = ? AND status = 'Present'`, [studentId]);
    const totalPresent = presRes[0].present || 0;

    // Total Volunteer Hours
    const hoursRes = await query(`SELECT SUM(hours) as sum_hours FROM volunteer_hours WHERE student_id = ?`, [studentId]);
    const totalHours = hoursRes[0].sum_hours || 0;

    const attendancePct = totalReg > 0 ? ((totalPresent / totalReg) * 100).toFixed(2) : 0;

    await query(
      `UPDATE students SET total_events = ?, volunteer_hours = ?, attendance_pct = ? WHERE id = ?`,
      [totalPresent, totalHours, attendancePct, studentId]
    );
  } catch (err) {
    console.error('Error recalculating stats:', err);
  }
}

// 1. GET ATTENDANCE SHEET FOR AN EVENT
router.get('/event/:eventId', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { eventId } = req.params;

    const students = await query(`
      SELECT er.id as registration_id, er.status as registration_status, s.id as student_id, s.nss_id, s.full_name, s.register_number, s.student_email, d.name as department_name,
             att.status as attendance_status, att.hours_awarded
      FROM event_registrations er
      JOIN students s ON er.student_id = s.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN attendance att ON (att.event_id = er.event_id AND att.student_id = er.student_id)
      WHERE er.event_id = ?
    `, [eventId]);

    res.json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. BULK MARK ATTENDANCE FOR AN EVENT
router.post('/mark', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { eventId, attendanceData } = req.body; // Array of { student_id, nss_id, status: 'Present'|'Absent', hours: number }

    if (!eventId || !Array.isArray(attendanceData)) {
      return res.status(400).json({ success: false, message: 'Invalid payload for attendance.' });
    }

    const eventRes = await query(`SELECT event_name, event_date, hours_allocated FROM events WHERE id = ?`, [eventId]);
    if (eventRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const event = eventRes[0];

    for (const item of attendanceData) {
      const { student_id, nss_id, status, hours } = item;
      const awardedHours = status === 'Present' ? (hours || event.hours_allocated || 4) : 0;

      // Check existing attendance record
      const existing = await query(`SELECT id FROM attendance WHERE event_id = ? AND student_id = ?`, [eventId, student_id]);

      if (existing.length > 0) {
        await query(
          `UPDATE attendance SET status = ?, hours_awarded = ?, marked_by = ?, attendance_date = ? WHERE id = ?`,
          [status, awardedHours, req.user.user_id, event.event_date, existing[0].id]
        );
      } else {
        await query(
          `INSERT INTO attendance (event_id, student_id, nss_id, attendance_date, status, hours_awarded, marked_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [eventId, student_id, nss_id, event.event_date, status, awardedHours, req.user.user_id]
        );
      }

      // Update registration status
      await query(`UPDATE event_registrations SET status = ? WHERE event_id = ? AND student_id = ?`, [status === 'Present' ? 'Attended' : 'Absent', eventId, student_id]);

      // Record / Update Volunteer Hours entry
      if (status === 'Present') {
        const existingVol = await query(`SELECT id FROM volunteer_hours WHERE event_id = ? AND student_id = ?`, [eventId, student_id]);
        if (existingVol.length > 0) {
          await query(`UPDATE volunteer_hours SET hours = ?, description = ? WHERE id = ?`, [awardedHours, `Participation in ${event.event_name}`, existingVol[0].id]);
        } else {
          await query(
            `INSERT INTO volunteer_hours (student_id, nss_id, event_id, hours, description, awarded_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, nss_id, eventId, awardedHours, `Participation in ${event.event_name}`, event.event_date]
          );
        }

        // Notify Student
        const stUser = await query(`SELECT user_id FROM students WHERE id = ?`, [student_id]);
        if (stUser.length > 0) {
          await query(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')`,
            [stUser[0].user_id, 'Attendance & Hours Updated', `Marked Present for "${event.event_name}". ${awardedHours} Volunteer Hours awarded!`]
          );
        }
      }

      // Recalculate stats for student
      await recalculateStudentStats(student_id);
    }

    // Mark Event Status to Completed
    await query(`UPDATE events SET status = 'Completed' WHERE id = ?`, [eventId]);

    await logActivity(req.user.user_id, req.user.email, req.user.role, `Marked attendance for event: ${event.event_name}`, 'Attendance Management', req);

    res.json({ success: true, message: 'Attendance marked and volunteer hours awarded successfully!' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET MY ATTENDANCE (Student view)
router.get('/my/attendance', verifyToken, checkRole(['Student']), async (req, res) => {
  try {
    const studentRes = await query(`SELECT id FROM students WHERE user_id = ?`, [req.user.user_id]);
    if (studentRes.length === 0) return res.json({ success: true, attendance: [], totalHours: 0 });

    const studentId = studentRes[0].id;

    const records = await query(`
      SELECT att.*, e.event_name, e.category, e.venue
      FROM attendance att
      JOIN events e ON att.event_id = e.id
      WHERE att.student_id = ?
      ORDER BY att.attendance_date DESC
    `, [studentId]);

    const hoursBreakdown = await query(`
      SELECT * FROM volunteer_hours WHERE student_id = ? ORDER BY awarded_date DESC
    `, [studentId]);

    res.json({
      success: true,
      attendance: records,
      volunteerHours: hoursBreakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
