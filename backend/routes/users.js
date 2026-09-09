const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// 1. GET ALL USERS
router.get('/', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { role, status, search } = req.query;

    let sql = `SELECT id, user_id, email, role, status, last_login, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role) {
      sql += ` AND role = ?`;
      params.push(role);
    }
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (user_id LIKE ? OR email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ` ORDER BY id DESC`;

    const users = await query(sql, params);
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. CREATE USER (PO, Admin, Super Admin)
router.post('/', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { role, email, password, fullName, phone, designation, nssUnitId } = req.body;

    if (!role || !email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // Role safety check
    if (role === 'Super Admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create another Super Admin account.' });
    }

    const existing = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Generate Role-specific ID
    let autoId = '';
    if (role === 'Super Admin') {
      const c = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'Super Admin'`);
      autoId = `NSSSA${String(c[0].count + 1).padStart(3, '0')}`;
    } else if (role === 'Admin') {
      const c = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'Admin'`);
      autoId = `NSSADMIN${String(c[0].count + 1).padStart(3, '0')}`;
    } else if (role === 'Programme Officer') {
      const c = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'Programme Officer'`);
      autoId = `NSSPO${String(c[0].count + 1).padStart(3, '0')}`;
    } else {
      autoId = `NSSSTU${Date.now().toString().slice(-6)}`;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    await query(
      `INSERT INTO users (user_id, email, password, role, status) VALUES (?, ?, ?, ?, 'Active')`,
      [autoId, email, hashedPassword, role]
    );

    // Create detail record based on role
    if (role === 'Programme Officer') {
      await query(
        `INSERT INTO programme_officers (user_id, po_id, full_name, email, phone, nss_unit_id, designation) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [autoId, autoId, fullName, email, phone || '', nssUnitId || 1, designation || 'Programme Officer']
      );
    } else if (role === 'Admin' || role === 'Super Admin') {
      await query(
        `INSERT INTO admins (user_id, admin_id, full_name, email, phone, designation, role_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [autoId, autoId, fullName, email, phone || '', designation || role, role]
      );
    }

    await logActivity(req.user.user_id, req.user.email, req.user.role, `Created new ${role} account (${autoId}: ${fullName})`, 'User Management', req);

    res.json({ success: true, message: `Account created successfully with ID: ${autoId}`, user_id: autoId });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. UPDATE USER ROLE OR STATUS
router.put('/:id', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const userRes = await query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (userRes.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes[0];

    if (user.role === 'Super Admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can modify a Super Admin user.' });
    }

    if (role) {
      await query(`UPDATE users SET role = ? WHERE id = ?`, [role, id]);
    }
    if (status) {
      await query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
      if (user.role === 'Student') {
        await query(`UPDATE students SET status = ? WHERE user_id = ?`, [status === 'Active' ? 'Approved' : 'Inactive', user.user_id]);
      }
    }

    await logActivity(req.user.user_id, req.user.email, req.user.role, `Updated user ${user.user_id} (Role: ${role || user.role}, Status: ${status || user.status})`, 'User Management', req);

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. RESET PASSWORD
router.post('/:id/reset-password', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
    await logActivity(req.user.user_id, req.user.email, req.user.role, `Reset password for user ID ${id}`, 'User Management', req);

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE USER
router.delete('/:id', verifyToken, checkRole(['Super Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await query(`SELECT user_id, role FROM users WHERE id = ?`, [id]);
    if (userRes.length > 0) {
      const u = userRes[0];
      await query(`DELETE FROM users WHERE id = ?`, [id]);
      if (u.role === 'Student') await query(`DELETE FROM students WHERE user_id = ?`, [u.user_id]);
      if (u.role === 'Programme Officer') await query(`DELETE FROM programme_officers WHERE user_id = ?`, [u.user_id]);
      if (u.role === 'Admin' || u.role === 'Super Admin') await query(`DELETE FROM admins WHERE user_id = ?`, [u.user_id]);

      await logActivity(req.user.user_id, req.user.email, req.user.role, `Deleted user account: ${u.user_id}`, 'User Management', req);
    }
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
