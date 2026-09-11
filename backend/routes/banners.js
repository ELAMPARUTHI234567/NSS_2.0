const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

const multer = require('multer');

// Configure Multer storage in memory for converting uploaded photos into persistent Data URIs
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WEBP photos are allowed.'));
    }
  }
});

// Helper to log administrative actions
async function logActivity(userId, userName, role, action, module = 'Banner Management', req = null) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await query(
      `INSERT INTO activity_logs (user_id, user_name, role, action, module, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userName, role, action, module, ip]
    );
  } catch (e) {
    console.error('Activity log error:', e.message);
  }
}

// 1. GET ALL BANNERS (Public gets active only; Admin can fetch all via ?all=true)
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    let sql = `SELECT * FROM homepage_banners WHERE is_active = 1 ORDER BY display_order ASC, id ASC`;
    if (showAll) {
      sql = `SELECT * FROM homepage_banners ORDER BY display_order ASC, id ASC`;
    }
    const banners = await query(sql);
    res.json({
      success: true,
      count: banners.length,
      banners
    });
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve banners: ' + err.message });
  }
});

// 2. UPLOAD BANNER PHOTO (Admin / Super Admin Only)
router.post('/upload', verifyToken, checkRole(['Admin', 'Super Admin']), (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image photo file selected.' });
    }

    try {
      const mimeType = req.file.mimetype;
      const base64Data = req.file.buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      res.json({
        success: true,
        image_url: dataUri,
        message: 'Banner photo uploaded successfully.'
      });
    } catch (processErr) {
      console.error('Process uploaded photo error:', processErr);
      res.status(500).json({ success: false, message: 'Failed to process uploaded photo.' });
    }
  });
});

// 2. CREATE NEW BANNER (Admin / Super Admin Only)
router.post('/admin', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { title, subtitle, description, image_url, button_text, button_link, display_order, is_active } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ success: false, message: 'Banner title and image URL are required.' });
    }

    const orderVal = parseInt(display_order) || 1;
    const activeVal = is_active === false || is_active === 0 ? 0 : 1;

    const result = await query(
      `INSERT INTO homepage_banners (title, subtitle, description, image_url, button_text, button_link, display_order, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        subtitle ? subtitle.trim() : '',
        description ? description.trim() : '',
        image_url.trim(),
        button_text ? button_text.trim() : 'Explore Events',
        button_link ? button_link.trim() : 'public-events',
        orderVal,
        activeVal,
        req.user.user_id
      ]
    );

    const newBannerId = result.insertId || result.id;
    await logActivity(req.user.user_id, req.user.name || req.user.user_id, req.user.role, `Created new banner: "${title}"`, 'Banner Management', req);

    res.status(201).json({
      success: true,
      banner_id: newBannerId,
      message: 'Homepage banner created successfully.'
    });
  } catch (err) {
    console.error('Create banner error:', err);
    res.status(500).json({ success: false, message: 'Failed to create banner: ' + err.message });
  }
});

// 3. UPDATE BANNER (Admin / Super Admin Only)
router.put('/admin/:id', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const bannerId = req.params.id;
    const { title, subtitle, description, image_url, button_text, button_link, display_order, is_active } = req.body;

    const existing = await query(`SELECT * FROM homepage_banners WHERE id = ?`, [bannerId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    const orderVal = display_order !== undefined ? parseInt(display_order) : existing[0].display_order;
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : existing[0].is_active;

    await query(
      `UPDATE homepage_banners 
       SET title = ?, subtitle = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title ? title.trim() : existing[0].title,
        subtitle !== undefined ? subtitle.trim() : existing[0].subtitle,
        description !== undefined ? description.trim() : existing[0].description,
        image_url ? image_url.trim() : existing[0].image_url,
        button_text !== undefined ? button_text.trim() : existing[0].button_text,
        button_link !== undefined ? button_link.trim() : existing[0].button_link,
        orderVal,
        activeVal,
        bannerId
      ]
    );

    await logActivity(req.user.user_id, req.user.name || req.user.user_id, req.user.role, `Updated banner ID #${bannerId}`, 'Banner Management', req);

    res.json({
      success: true,
      message: 'Banner updated successfully.'
    });
  } catch (err) {
    console.error('Update banner error:', err);
    res.status(500).json({ success: false, message: 'Failed to update banner: ' + err.message });
  }
});

// 4. TOGGLE BANNER STATUS (Admin / Super Admin Only)
router.patch('/admin/:id/status', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const bannerId = req.params.id;
    const { is_active } = req.body;

    const existing = await query(`SELECT * FROM homepage_banners WHERE id = ?`, [bannerId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    const activeVal = is_active ? 1 : 0;
    await query(`UPDATE homepage_banners SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [activeVal, bannerId]);

    await logActivity(req.user.user_id, req.user.name || req.user.user_id, req.user.role, `${activeVal ? 'Activated' : 'Deactivated'} banner ID #${bannerId}`, 'Banner Management', req);

    res.json({
      success: true,
      message: `Banner ${activeVal ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle banner status: ' + err.message });
  }
});

// 5. DELETE BANNER (Admin / Super Admin Only)
router.delete('/admin/:id', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const bannerId = req.params.id;
    const existing = await query(`SELECT * FROM homepage_banners WHERE id = ?`, [bannerId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    await query(`DELETE FROM homepage_banners WHERE id = ?`, [bannerId]);
    await logActivity(req.user.user_id, req.user.name || req.user.user_id, req.user.role, `Deleted banner ID #${bannerId} ("${existing[0].title}")`, 'Banner Management', req);

    res.json({
      success: true,
      message: 'Banner deleted successfully.'
    });
  } catch (err) {
    console.error('Delete banner error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete banner: ' + err.message });
  }
});

module.exports = router;
