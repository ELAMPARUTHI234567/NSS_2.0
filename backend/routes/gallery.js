const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET GALLERY ITEMS (Public & Dashboard)
router.get('/', async (req, res) => {
  try {
    const { category, nss_unit_id, event_id } = req.query;

    let sql = `
      SELECT g.*, u.unit_name, e.event_name
      FROM gallery g
      LEFT JOIN nss_units u ON g.nss_unit_id = u.id
      LEFT JOIN events e ON g.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ` AND g.category = ?`;
      params.push(category);
    }
    if (nss_unit_id) {
      sql += ` AND g.nss_unit_id = ?`;
      params.push(nss_unit_id);
    }
    if (event_id) {
      sql += ` AND g.event_id = ?`;
      params.push(event_id);
    }

    sql += ` ORDER BY g.created_at DESC`;

    const items = await query(sql, params);
    res.json({ success: true, count: items.length, gallery: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD GALLERY ITEM (Admin / PO)
router.post('/', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { title, category, imageUrl, eventId, nssUnitId } = req.body;

    if (!title || !category || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title, category and image URL are required.' });
    }

    await query(
      `INSERT INTO gallery (title, category, image_url, event_id, nss_unit_id, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, category, imageUrl, eventId || null, nssUnitId || null, req.user.user_id]
    );

    res.json({ success: true, message: 'Photo uploaded to Gallery!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE GALLERY ITEM
router.delete('/:id', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    await query(`DELETE FROM gallery WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Item deleted from gallery.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
