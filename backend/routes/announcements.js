const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET ANNOUNCEMENTS
router.get('/', async (req, res) => {
  try {
    const announcements = await query(`SELECT * FROM announcements WHERE status = 'Published' ORDER BY publish_date DESC`);
    res.json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE ANNOUNCEMENT (Admin/PO)
router.post('/', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { title, description, category, priority, attachment } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const result = await query(
      `INSERT INTO announcements (title, description, category, priority, attachment, published_by, publish_date, status)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'Published')`,
      [title, description, category || 'General', priority || 'General', attachment || '', req.user.user_id]
    );

    // Send notifications to all active students
    const students = await query(`SELECT user_id FROM students WHERE status = 'Approved'`);
    for (const st of students) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'announcement')`,
        [st.user_id, `Announcement: ${title}`, description.substring(0, 100) + '...']
      );
    }

    res.json({ success: true, message: 'Announcement published successfully!', id: result.insertId });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE ANNOUNCEMENT
router.delete('/:id', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    await query(`DELETE FROM announcements WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
