const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET CERTIFICATES
router.get('/', verifyToken, async (req, res) => {
  try {
    let sql = `
      SELECT c.*, s.full_name, s.register_number, s.nss_id, e.event_name
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      LEFT JOIN events e ON c.event_id = e.id
    `;
    const params = [];

    if (req.user.role === 'Student') {
      const st = await query(`SELECT id FROM students WHERE user_id = ?`, [req.user.user_id]);
      if (st.length === 0) return res.json({ success: true, certificates: [] });
      sql += ` WHERE c.student_id = ?`;
      params.push(st[0].id);
    }

    sql += ` ORDER BY c.issue_date DESC`;

    const certificates = await query(sql, params);
    res.json({ success: true, count: certificates.length, certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPLOAD / ISSUE CERTIFICATE (Admin / PO)
router.post('/upload', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { certificateName, studentId, eventId, issueDate, fileUrl } = req.body;

    if (!certificateName || !studentId) {
      return res.status(400).json({ success: false, message: 'Certificate name and student selection are required.' });
    }

    const stRes = await query(`SELECT user_id, nss_id, full_name FROM students WHERE id = ?`, [studentId]);
    if (stRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = stRes[0];
    const certNum = `CERT-NSS-${Date.now().toString().slice(-6)}`;
    const url = fileUrl || `/uploads/cert_${student.nss_id}_${Date.now()}.pdf`;

    await query(
      `INSERT INTO certificates (certificate_number, certificate_name, student_id, nss_id, event_id, issue_date, file_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [certNum, certificateName, studentId, student.nss_id, eventId || null, issueDate || new Date().toISOString().split('T')[0], url]
    );

    // Notify Student
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'certificate')`,
      [student.user_id, 'New Certificate Issued!', `Your certificate "${certificateName}" has been issued and is available on your dashboard.`]
    );

    res.json({ success: true, message: 'Certificate issued successfully!' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
