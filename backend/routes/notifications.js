const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// GET USER NOTIFICATIONS
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.user_id]
    );

    const unreadRes = await query(
      `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      unreadCount: unreadRes[0].unread_count || 0,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// MARK ALL AS READ OR SINGLE READ
router.post('/mark-read', verifyToken, async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await query(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, req.user.user_id]);
    } else {
      await query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.user_id]);
    }
    res.json({ success: true, message: 'Notifications updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
