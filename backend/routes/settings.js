const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET SYSTEM SETTINGS & METADATA (Departments, NSS Units, Academic Years)
router.get('/', async (req, res) => {
  try {
    const departments = await query(`SELECT * FROM departments ORDER BY code ASC`);
    const nssUnits = await query(`SELECT * FROM nss_units ORDER BY unit_code ASC`);
    const academicYears = await query(`SELECT * FROM academic_years ORDER BY id DESC`);
    const settingsRaw = await query(`SELECT * FROM system_settings`);

    const settings = {};
    settingsRaw.forEach(s => {
      settings[s.setting_key] = s.setting_value;
    });

    res.json({
      success: true,
      departments,
      nssUnits,
      academicYears,
      settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE SYSTEM SETTINGS (Super Admin)
router.put('/', verifyToken, checkRole(['Super Admin', 'Admin']), async (req, res) => {
  try {
    const { settings } = req.body;
    if (settings && typeof settings === 'object') {
      for (const [key, val] of Object.entries(settings)) {
        await query(
          `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, String(val), String(val)]
        );
      }
    }
    res.json({ success: true, message: 'System settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE DEPARTMENT
router.post('/departments', verifyToken, checkRole(['Super Admin', 'Admin']), async (req, res) => {
  try {
    const { code, name } = req.body;
    await query(`INSERT INTO departments (code, name) VALUES (?, ?)`, [code, name]);
    res.json({ success: true, message: 'Department created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE NSS UNIT
router.post('/nss-units', verifyToken, checkRole(['Super Admin', 'Admin']), async (req, res) => {
  try {
    const { unit_code, unit_name, po_name, capacity } = req.body;
    await query(`INSERT INTO nss_units (unit_code, unit_name, po_name, capacity) VALUES (?, ?, ?, ?)`, [unit_code, unit_name, po_name || '', capacity || 100]);
    res.json({ success: true, message: 'NSS Unit created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
