const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET ACTIVITY LOGS (Admin & Super Admin)
router.get('/', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const logs = await query(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100`);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
