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

// 1. GET ALL EVENTS (Public & Authenticated)
router.get('/', async (req, res) => {
  try {
    const { category, nss_unit_id, status } = req.query;

    let sql = `
      SELECT e.*, u.unit_name, u.unit_code
      FROM events e
      LEFT JOIN nss_units u ON e.nss_unit_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ` AND e.category = ?`;
      params.push(category);
    }
    if (nss_unit_id) {
      sql += ` AND e.nss_unit_id = ?`;
      params.push(nss_unit_id);
    }
    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY e.event_date ASC`;

    const events = await query(sql, params);
    res.json({ success: true, count: events.length, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET EVENT BY ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const events = await query(`
      SELECT e.*, u.unit_name, u.unit_code
      FROM events e
      LEFT JOIN nss_units u ON e.nss_unit_id = u.id
      WHERE e.id = ?
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Also fetch registered count & list if admin
    const registered = await query(`
      SELECT er.*, s.full_name, s.register_number, s.department_id, d.name as department_name
      FROM event_registrations er
      JOIN students s ON er.student_id = s.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE er.event_id = ?
    `, [id]);

    res.json({
      success: true,
      event: events[0],
      registrations: registered
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. CREATE EVENT (Admin / PO)
router.post('/', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const {
      eventName, description, category, eventDate, eventTime, venue,
      organizer, nssUnitId, maxParticipants, registrationDeadline,
      eventPoster, instructions, hoursAllocated
    } = req.body;

    if (!eventName || !description || !eventDate || !venue || !nssUnitId) {
      return res.status(400).json({ success: false, message: 'Please fill in all mandatory event fields.' });
    }

    const defaultPoster = eventPoster || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop';

    const result = await query(
      `INSERT INTO events (
        event_name, description, category, event_date, event_time, venue, organizer,
        nss_unit_id, max_participants, registered_count, registration_deadline,
        event_poster, instructions, hours_allocated, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'Registration Open', ?)`,
      [
        eventName, description, category || 'General Service', eventDate, eventTime || '09:00 AM', venue,
        organizer || 'NSS Team', nssUnitId, maxParticipants || 50, registrationDeadline || `${eventDate} 23:59:59`,
        defaultPoster, instructions || '', hoursAllocated || 4, req.user.user_id
      ]
    );

    // Notify active students about new event
    const activeStudents = await query(`SELECT user_id FROM students WHERE status = 'Approved'`);
    for (const student of activeStudents) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')`,
        [student.user_id, 'New NSS Event Published!', `Event "${eventName}" is scheduled for ${eventDate}. Register before deadline!`]
      );
    }

    await logActivity(req.user.user_id, req.user.email, req.user.role, `Created new event: ${eventName}`, 'Event Management', req);

    res.json({ success: true, message: 'Event created successfully!', event_id: result.insertId });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. UPDATE EVENT DETAILS / STATUS
router.put('/:id', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, description, category, eventDate, eventTime, venue, organizer, maxParticipants, status, instructions, hoursAllocated } = req.body;

    await query(
      `UPDATE events SET 
        event_name = COALESCE(?, event_name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        event_date = COALESCE(?, event_date),
        event_time = COALESCE(?, event_time),
        venue = COALESCE(?, venue),
        organizer = COALESCE(?, organizer),
        max_participants = COALESCE(?, max_participants),
        status = COALESCE(?, status),
        instructions = COALESCE(?, instructions),
        hours_allocated = COALESCE(?, hours_allocated)
       WHERE id = ?`,
      [eventName, description, category, eventDate, eventTime, venue, organizer, maxParticipants, status, instructions, hoursAllocated, id]
    );

    await logActivity(req.user.user_id, req.user.email, req.user.role, `Updated event ID ${id}`, 'Event Management', req);

    res.json({ success: true, message: 'Event updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. REGISTER FOR EVENT (Student)
router.post('/:id/register', verifyToken, checkRole(['Student']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get Student details
    const studentRes = await query(`SELECT * FROM students WHERE user_id = ?`, [req.user.user_id]);
    if (studentRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const student = studentRes[0];

    if (student.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Your student registration must be Approved by Admin before registering for events.' });
    }

    // Get Event details
    const eventRes = await query(`SELECT * FROM events WHERE id = ?`, [id]);
    if (eventRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const event = eventRes[0];

    if (event.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This event has been cancelled.' });
    }

    // Check capacity limit
    if (event.registered_count >= event.max_participants || event.status === 'Full') {
      return res.status(400).json({ success: false, message: 'Registration closed. Event seats are full.' });
    }

    // Check existing registration
    const existing = await query(`SELECT * FROM event_registrations WHERE event_id = ? AND student_id = ?`, [id, student.id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already registered for this event.' });
    }

    // Register Student
    await query(
      `INSERT INTO event_registrations (event_id, student_id, nss_id, status) VALUES (?, ?, ?, 'Registered')`,
      [id, student.id, student.nss_id]
    );

    // Update Event registered count
    const newCount = event.registered_count + 1;
    const newStatus = newCount >= event.max_participants ? 'Full' : event.status;

    await query(`UPDATE events SET registered_count = ?, status = ? WHERE id = ?`, [newCount, newStatus, id]);

    // Send Notification
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')`,
      [req.user.user_id, 'Event Registration Confirmed!', `You have registered for ${event.event_name} on ${event.event_date}.`]
    );

    await logActivity(req.user.user_id, student.full_name, 'Student', `Registered for event: ${event.event_name}`, 'Event Registration', req);

    res.json({ success: true, message: 'Successfully registered for the event!' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. GET MY REGISTRATIONS (Student)
router.get('/my/registrations', verifyToken, checkRole(['Student']), async (req, res) => {
  try {
    const studentRes = await query(`SELECT id FROM students WHERE user_id = ?`, [req.user.user_id]);
    if (studentRes.length === 0) return res.json({ success: true, registrations: [] });

    const studentId = studentRes[0].id;

    const registrations = await query(`
      SELECT er.*, e.event_name, e.category, e.event_date, e.event_time, e.venue, e.hours_allocated, e.event_poster
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.student_id = ?
      ORDER BY er.registration_date DESC
    `, [studentId]);

    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
