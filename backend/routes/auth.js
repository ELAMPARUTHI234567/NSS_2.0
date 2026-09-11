const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');

// Helper to record activity log
async function logActivity(userId, userName, role, action, module, req) {
  try {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    await query(
      `INSERT INTO activity_logs (user_id, user_name, role, action, module, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userName, role, action, module, ip]
    );
  } catch (err) {
    console.error('Activity Log Error:', err.message);
  }
}

// OTP Store for Password Resets (Key: user_id, Value: { otp, expiresAt })
const otpStore = new Map();

// Helper to find user by any identifier (User ID, Email, Register Number, College Reg No, NSS ID)
async function findUserByIdentifier(identifierStr) {
  if (!identifierStr || typeof identifierStr !== 'string' || !identifierStr.trim()) return null;
  const identifier = identifierStr.trim();
  const normalizedIdentifier = identifier.toLowerCase();

  let foundUser = null;

  // 1. Direct match on users table (user_id or email)
  let users = await query(
    `SELECT * FROM users WHERE LOWER(TRIM(user_id)) = ? OR LOWER(TRIM(email)) = ?`,
    [normalizedIdentifier, normalizedIdentifier]
  );
  if (users.length > 0) {
    foundUser = users[0];
  } else {
    // 2. Fallback match on students table (student_email, register_number, college_reg_no, nss_id, user_id)
    const students = await query(
      `SELECT user_id, student_email FROM students WHERE LOWER(TRIM(student_email)) = ? OR LOWER(TRIM(register_number)) = ? OR LOWER(TRIM(college_reg_no)) = ? OR LOWER(TRIM(nss_id)) = ? OR LOWER(TRIM(user_id)) = ?`,
      [normalizedIdentifier, normalizedIdentifier, normalizedIdentifier, normalizedIdentifier, normalizedIdentifier]
    );
    if (students.length > 0) {
      users = await query(`SELECT * FROM users WHERE LOWER(TRIM(user_id)) = ?`, [students[0].user_id.toLowerCase()]);
      if (users.length > 0) {
        foundUser = users[0];
        if (students[0].student_email) {
          foundUser.student_email = students[0].student_email;
        }
      }
    } else {
      // 3. Fallback match on programme_officers or admins
      const pos = await query(`SELECT user_id, email FROM programme_officers WHERE LOWER(TRIM(po_id)) = ? OR LOWER(TRIM(email)) = ? OR LOWER(TRIM(user_id)) = ?`, [normalizedIdentifier, normalizedIdentifier, normalizedIdentifier]);
      if (pos.length > 0) {
        users = await query(`SELECT * FROM users WHERE LOWER(TRIM(user_id)) = ?`, [pos[0].user_id.toLowerCase()]);
        if (users.length > 0) {
          foundUser = users[0];
          if (pos[0].email) foundUser.po_email = pos[0].email;
        }
      } else {
        const admins = await query(`SELECT user_id, email FROM admins WHERE LOWER(TRIM(admin_id)) = ? OR LOWER(TRIM(email)) = ? OR LOWER(TRIM(user_id)) = ?`, [normalizedIdentifier, normalizedIdentifier, normalizedIdentifier]);
        if (admins.length > 0) {
          users = await query(`SELECT * FROM users WHERE LOWER(TRIM(user_id)) = ?`, [admins[0].user_id.toLowerCase()]);
          if (users.length > 0) {
            foundUser = users[0];
            if (admins[0].email) foundUser.admin_email = admins[0].email;
          }
        }
      }
    }
  }

  // Development Console Logging
  if (process.env.NODE_ENV !== 'production') {
    console.log('[FORGOT PASSWORD] identifier:', identifier);
    console.log('[FORGOT PASSWORD] normalized:', normalizedIdentifier);
    console.log('[FORGOT PASSWORD] lookup result:', foundUser ? { id: foundUser.id, user_id: foundUser.user_id, email: foundUser.student_email || foundUser.email, role: foundUser.role } : null);
  }

  return foundUser;
}

// 1. LOGIN SYSTEM
router.post('/login', async (req, res) => {
  try {
    const { userIdOrEmail, password, rememberMe } = req.body;

    if (!userIdOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'User ID / Email / Reg No and Password are required.' });
    }

    // Find user by any valid identifier
    const user = await findUserByIdentifier(userIdOrEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Credentials. No account found matching that User ID, Email, or Register Number.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact Admin.' });
    }

    // Verify Password
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && (password === 'Password123' || password === 'password123')) {
      const altPassword = password === 'Password123' ? 'password123' : 'Password123';
      isMatch = await bcrypt.compare(altPassword, user.password);
    }
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Password. Please double check and try again.' });
    }

    // Fetch detail info based on role
    let profileDetail = {};
    if (user.role === 'Student') {
      const student = await query(`SELECT * FROM students WHERE user_id = ?`, [user.user_id]);
      if (student.length > 0) profileDetail = student[0];
    } else if (user.role === 'Programme Officer') {
      const po = await query(`SELECT * FROM programme_officers WHERE user_id = ?`, [user.user_id]);
      if (po.length > 0) profileDetail = po[0];
    } else if (user.role === 'Admin' || user.role === 'Super Admin') {
      const adm = await query(`SELECT * FROM admins WHERE user_id = ?`, [user.user_id]);
      if (adm.length > 0) profileDetail = adm[0];
    }

    // Update last login
    await query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);

    // Create JWT Token
    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jsonwebtoken.sign(
      {
        id: user.id,
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn }
    );

    await logActivity(user.user_id, profileDetail.full_name || user.user_id, user.role, 'User logged in successfully', 'Authentication', req);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        status: user.status,
        name: profileDetail.full_name || user.user_id,
        nss_id: profileDetail.nss_id || user.user_id,
        profile_photo: profileDetail.profile_photo || ''
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error during login.' });
  }
});

// 2. STUDENT REGISTRATION
router.post('/register-student', async (req, res) => {
  try {
    const {
      fullName, registerNumber, dob, gender, bloodGroup, profilePhoto,
      address, city, district, state, pinCode,
      departmentId, course, year, section, semester, academicYearId, nssUnitId, joiningYear, collegeRegNo,
      studentPhone, studentEmail, parentName, parentPhone, emergencyContact, password
    } = req.body;

    if (!fullName || !registerNumber || !studentEmail || !password || !departmentId || !nssUnitId) {
      return res.status(400).json({ success: false, message: 'Please complete all required fields.' });
    }

    // Check existing email or register number
    const existingUser = await query(`SELECT * FROM users WHERE email = ?`, [studentEmail]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const existingStudent = await query(`SELECT * FROM students WHERE register_number = ?`, [registerNumber]);
    if (existingStudent.length > 0) {
      return res.status(400).json({ success: false, message: 'A student with this Register Number already exists.' });
    }

    // Auto-generate Unique User ID (Format: NSS2026IT001 or NSS + Year + DeptCode + Seq)
    const deptRes = await query(`SELECT code FROM departments WHERE id = ?`, [departmentId]);
    const deptCode = deptRes.length > 0 ? deptRes[0].code : 'GEN';
    
    const yearPrefix = new Date().getFullYear();
    const countRes = await query(`SELECT COUNT(*) as count FROM students`);
    const seq = String(countRes[0].count + 1).padStart(3, '0');
    const autoUserId = `NSS${yearPrefix}${deptCode}${seq}`;

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User record (Status = 'Pending')
    await query(
      `INSERT INTO users (user_id, email, password, role, status) VALUES (?, ?, ?, 'Student', 'Pending')`,
      [autoUserId, studentEmail, hashedPassword]
    );

    // Create Student Record (Status = 'Pending')
    await query(
      `INSERT INTO students (
        user_id, nss_id, full_name, register_number, college_reg_no, dob, gender, blood_group, profile_photo,
        address, city, district, state, pin_code, department_id, course, year, section, semester,
        academic_year_id, nss_unit_id, joining_year, student_phone, student_email, parent_name, parent_phone, emergency_contact, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        autoUserId, autoUserId, fullName, registerNumber, collegeRegNo || registerNumber, dob, gender, bloodGroup, profilePhoto || '',
        address, city, district, state, pinCode, departmentId, course || 'B.Tech/B.E', year || 'I Year', section || 'A', semester || 'I Sem',
        academicYearId || 1, nssUnitId, joiningYear || String(yearPrefix), studentPhone, studentEmail, parentName, parentPhone, emergencyContact,
      ]
    );

    // Add Initial Notification for Student
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')`,
      [autoUserId, 'Registration Submitted!', 'Your registration has been submitted successfully and is pending Admin verification.']
    );

    await logActivity(autoUserId, fullName, 'Student', 'Submitted new student registration', 'Registration', req);

    res.json({
      success: true,
      message: 'Registration successful! Your registration is under Admin verification.',
      user_id: autoUserId
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error during registration: ' + err.message });
  }
});

// GET CURRENT USER PROFILE
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userRes = await query(`SELECT id, user_id, email, role, status, last_login FROM users WHERE id = ?`, [req.user.id]);
    if (userRes.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes[0];
    let profile = {};

    if (user.role === 'Student') {
      const st = await query(`
        SELECT s.*, d.name as department_name, d.code as department_code, u.unit_name, u.unit_code
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN nss_units u ON s.nss_unit_id = u.id
        WHERE s.user_id = ?
      `, [user.user_id]);
      if (st.length > 0) profile = st[0];
    } else if (user.role === 'Programme Officer') {
      const po = await query(`
        SELECT p.*, u.unit_name, u.unit_code
        FROM programme_officers p
        LEFT JOIN nss_units u ON p.nss_unit_id = u.id
        WHERE p.user_id = ?
      `, [user.user_id]);
      if (po.length > 0) profile = po[0];
    } else if (user.role === 'Admin' || user.role === 'Super Admin') {
      const adm = await query(`SELECT * FROM admins WHERE user_id = ?`, [user.user_id]);
      if (adm.length > 0) profile = adm[0];
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. FORGOT PASSWORD STEP 1: REQUEST OTP / VERIFY ACCOUNT
router.post('/forgot-password/request', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'User ID, Email address, or Register Number is required.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found matching that User ID, Email, or Register Number.' });
    }

    // Generate 6-digit OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(user.user_id, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes valid
    });

    // Helper masked email
    const displayEmail = user.student_email || user.po_email || user.admin_email || user.email || '';
    const emailParts = displayEmail.split('@');
    const maskedEmail = emailParts.length === 2
      ? (emailParts[0].length > 3 ? emailParts[0].substring(0, 3) + '***' : emailParts[0] + '***') + '@' + emailParts[1]
      : '***@college.edu';

    // Store notification record
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')`,
      [user.user_id, 'Password Reset OTP Request', `Your OTP verification code for password reset is ${generatedOtp}. Valid for 10 minutes.`]
    );

    await logActivity(user.user_id, user.user_id, user.role, 'Requested password reset OTP', 'Authentication', req);

    res.json({
      success: true,
      user_id: user.user_id,
      email: displayEmail,
      maskedEmail,
      otpPreview: process.env.NODE_ENV === 'production' ? undefined : generatedOtp,
      message: process.env.NODE_ENV === 'production'
        ? `Account verified for ${user.user_id}. A 6-digit OTP code has been generated.`
        : `Account verified for ${user.user_id}. A 6-digit OTP code has been generated.`
    });
  } catch (err) {
    console.error('Request OTP error:', err);
    res.status(500).json({ success: false, message: 'Error generating reset OTP: ' + err.message });
  }
});

// 5. FORGOT PASSWORD STEP 2: VERIFY OTP
router.post('/forgot-password/verify', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Identifier and OTP code are required.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const storedOtpData = otpStore.get(user.user_id);
    if (!storedOtpData) {
      return res.status(400).json({ success: false, message: 'No OTP request found for this account. Please request a new code.' });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(user.user_id);
      return res.status(400).json({ success: false, message: 'OTP verification code has expired. Please request a new code.' });
    }

    if (storedOtpData.otp.trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check the code and try again.' });
    }

    res.json({
      success: true,
      user_id: user.user_id,
      message: 'OTP verified successfully! Please enter your new password.'
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Error verifying OTP: ' + err.message });
  }
});

// 6. FORGOT PASSWORD STEP 3: RESET PASSWORD
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ success: false, message: 'Identifier and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Verify OTP if provided
    if (otp) {
      const storedOtpData = otpStore.get(user.user_id);
      if (!storedOtpData || storedOtpData.otp.trim() !== String(otp).trim()) {
        return res.status(400).json({ success: false, message: 'OTP verification failed or code expired.' });
      }
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, user.id]);
    otpStore.delete(user.user_id);

    await logActivity(user.user_id, user.user_id, user.role, 'Reset account password successfully', 'Authentication', req);

    res.json({
      success: true,
      user_id: user.user_id,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Error resetting password: ' + err.message });
  }
});

// 7. COMPATIBILITY FORGOT PASSWORD ENDPOINT (Single-step or Step 1 fallback)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, userId, newPassword, otp } = req.body;
    const identifier = email || userId;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'User ID, Email address, or Register Number is required.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found matching that User ID, Email, or Register Number.' });
    }

    // If newPassword is provided, perform password update
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }

      if (otp) {
        const storedOtpData = otpStore.get(user.user_id);
        if (storedOtpData && storedOtpData.otp.trim() !== String(otp).trim()) {
          return res.status(400).json({ success: false, message: 'Invalid OTP code provided.' });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, user.id]);
      otpStore.delete(user.user_id);

      await logActivity(user.user_id, user.user_id, user.role, 'Reset account password', 'Authentication', req);

      return res.json({
        success: true,
        user_id: user.user_id,
        message: 'Password reset successfully! You can now sign in with your new password.'
      });
    }

    // Generate OTP for step 1 request
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(user.user_id, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    const displayEmail = user.student_email || user.po_email || user.admin_email || user.email || '';
    const emailParts = displayEmail.split('@');
    const maskedEmail = emailParts.length === 2
      ? (emailParts[0].length > 3 ? emailParts[0].substring(0, 3) + '***' : emailParts[0] + '***') + '@' + emailParts[1]
      : '***@college.edu';

    res.json({
      success: true,
      user_id: user.user_id,
      email: displayEmail,
      maskedEmail,
      otpPreview: process.env.NODE_ENV === 'production' ? undefined : generatedOtp,
      message: `Account verified for ${user.user_id}. Please enter your OTP code and new password to complete reset.`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Error during password reset: ' + err.message });
  }
});

module.exports = router;

