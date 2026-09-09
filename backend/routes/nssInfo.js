const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET NSS INFORMATION (Public & Student)
router.get('/', async (req, res) => {
  try {
    const info = await query(`SELECT * FROM nss_information WHERE published = 1`);
    const formatted = {};
    info.forEach(item => {
      formatted[item.section_key] = item;
    });
    res.json({ success: true, info: formatted, raw: info });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE / PUBLISH NSS INFORMATION (Admin)
router.put('/:sectionKey', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const { title, content, published } = req.body;

    const existing = await query(`SELECT id FROM nss_information WHERE section_key = ?`, [sectionKey]);

    if (existing.length > 0) {
      await query(
        `UPDATE nss_information SET title = ?, content = ?, published = ?, updated_by = ? WHERE section_key = ?`,
        [title, content, published !== undefined ? published : 1, req.user.user_id, sectionKey]
      );
    } else {
      await query(
        `INSERT INTO nss_information (section_key, title, content, published, updated_by) VALUES (?, ?, ?, ?, ?)`,
        [sectionKey, title, content, published !== undefined ? published : 1, req.user.user_id]
      );
    }

    res.json({ success: true, message: 'NSS Information updated and published to live website!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
