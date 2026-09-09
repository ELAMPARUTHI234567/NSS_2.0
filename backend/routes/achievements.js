const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET ACHIEVEMENTS
router.get('/', verifyToken, async (req, res) => {
  try {
    let sql = `
      SELECT a.*, s.full_name, s.register_number, s.nss_id
      FROM achievements a
      JOIN students s ON a.student_id = s.id
    `;
    const params = [];

    if (req.user.role === 'Student') {
      const st = await query(`SELECT id FROM students WHERE user_id = ?`, [req.user.user_id]);
      if (st.length === 0) return res.json({ success: true, achievements: [] });
      sql += ` WHERE a.student_id = ?`;
      params.push(st[0].id);
    }

    sql += ` ORDER BY a.award_date DESC`;

    const achievements = await query(sql, params);
    res.json({ success: true, count: achievements.length, achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD ACHIEVEMENT (Admin / PO)
router.post('/', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { title, studentId, awardType, description, awardDate, givenBy } = req.body;

    if (!title || !studentId || !awardType) {
      return res.status(400).json({ success: false, message: 'Title, student and award type are required.' });
    }

    const stRes = await query(`SELECT user_id, nss_id, full_name FROM students WHERE id = ?`, [studentId]);
    if (stRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = stRes[0];

    await query(
      `INSERT INTO achievements (title, student_id, nss_id, award_type, description, award_date, given_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, studentId, student.nss_id, awardType, description || '', awardDate || new Date().toISOString().split('T')[0], givenBy || 'NSS Cell']
    );

    // Notify Student
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')`,
      [student.user_id, 'New Achievement Awarded!', `Congratulations! You received the award "${title}".`]
    );

    res.json({ success: true, message: 'Achievement added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
