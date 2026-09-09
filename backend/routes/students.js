const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// Helper to log activities
async function logActivity(userId, userName, role, action, module, req) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await query(
      `INSERT INTO activity_logs (user_id, user_name, role, action, module, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userName, role, action, module, ip]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

// 1. GET ALL STUDENTS (With filters, search & pagination)
router.get('/', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { department_id, year, section, nss_unit_id, academic_year_id, status, search } = req.query;

    let sql = `
      SELECT s.*, d.name as department_name, d.code as department_code, u.unit_name, u.unit_code, ay.year_label
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN nss_units u ON s.nss_unit_id = u.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      sql += ` AND s.department_id = ?`;
      params.push(department_id);
    }
    if (year) {
      sql += ` AND s.year = ?`;
      params.push(year);
    }
    if (section) {
      sql += ` AND s.section = ?`;
      params.push(section);
    }
    if (nss_unit_id) {
      sql += ` AND s.nss_unit_id = ?`;
      params.push(nss_unit_id);
    }
    if (academic_year_id) {
      sql += ` AND s.academic_year_id = ?`;
      params.push(academic_year_id);
    }
    if (status) {
      sql += ` AND s.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (s.full_name LIKE ? OR s.nss_id LIKE ? OR s.register_number LIKE ? OR s.student_email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY s.created_at DESC`;

    const students = await query(sql, params);
    res.json({ success: true, count: students.length, students });

  } catch (err) {
    console.error('Fetch students error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET SINGLE STUDENT PROFILE
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(id);

    let sql = `
      SELECT s.*, d.name as department_name, d.code as department_code, u.unit_name, u.unit_code, ay.year_label
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN nss_units u ON s.nss_unit_id = u.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      WHERE ${isNumeric ? 's.id = ?' : 's.user_id = ? OR s.nss_id = ?'}
    `;
    const params = isNumeric ? [id] : [id, id];

    const students = await query(sql, params);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = students[0];

    // If student role, ensure they are requesting their own profile
    if (req.user.role === 'Student' && req.user.user_id !== student.user_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view another student profile.' });
    }

    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. ADMIN FULL STUDENT DIRECT EDIT (ADMIN / SUPER ADMIN ONLY)
router.put('/:id', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(id);
    
    const existingRes = await query(
      `SELECT * FROM students WHERE ${isNumeric ? 'id = ?' : 'user_id = ? OR nss_id = ?'}`,
      isNumeric ? [id] : [id, id]
    );

    if (existingRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const oldStudent = existingRes[0];
    const b = req.body;

    const fieldsToUpdate = {
      full_name: b.full_name !== undefined ? b.full_name : oldStudent.full_name,
      dob: b.dob !== undefined ? b.dob : oldStudent.dob,
      gender: b.gender !== undefined ? b.gender : oldStudent.gender,
      blood_group: b.blood_group !== undefined ? b.blood_group : oldStudent.blood_group,
      profile_photo: b.profile_photo !== undefined ? b.profile_photo : oldStudent.profile_photo,
      address: b.address !== undefined ? b.address : oldStudent.address,
      city: b.city !== undefined ? b.city : oldStudent.city,
      district: b.district !== undefined ? b.district : oldStudent.district,
      state: b.state !== undefined ? b.state : oldStudent.state,
      pin_code: b.pin_code !== undefined ? b.pin_code : oldStudent.pin_code,
      register_number: b.register_number !== undefined ? b.register_number : oldStudent.register_number,
      college_reg_no: b.college_reg_no !== undefined ? b.college_reg_no : oldStudent.college_reg_no,
      department_id: b.department_id !== undefined ? b.department_id : oldStudent.department_id,
      course: b.course !== undefined ? b.course : oldStudent.course,
      year: b.year !== undefined ? b.year : oldStudent.year,
      section: b.section !== undefined ? b.section : oldStudent.section,
      semester: b.semester !== undefined ? b.semester : oldStudent.semester,
      academic_year_id: b.academic_year_id !== undefined ? b.academic_year_id : oldStudent.academic_year_id,
      nss_unit_id: b.nss_unit_id !== undefined ? b.nss_unit_id : oldStudent.nss_unit_id,
      joining_year: b.joining_year !== undefined ? b.joining_year : oldStudent.joining_year,
      student_phone: b.student_phone !== undefined ? b.student_phone : oldStudent.student_phone,
      student_email: b.student_email !== undefined ? b.student_email : oldStudent.student_email,
      parent_name: b.parent_name !== undefined ? b.parent_name : oldStudent.parent_name,
      parent_phone: b.parent_phone !== undefined ? b.parent_phone : oldStudent.parent_phone,
      emergency_contact: b.emergency_contact !== undefined ? b.emergency_contact : oldStudent.emergency_contact,
      nss_id: b.nss_id !== undefined ? b.nss_id : oldStudent.nss_id,
      volunteer_hours: b.volunteer_hours !== undefined ? b.volunteer_hours : oldStudent.volunteer_hours,
      attendance_pct: b.attendance_pct !== undefined ? b.attendance_pct : oldStudent.attendance_pct,
      status: b.status !== undefined ? b.status : oldStudent.status
    };

    await query(
      `UPDATE students SET
        full_name = ?, dob = ?, gender = ?, blood_group = ?, profile_photo = ?, address = ?, city = ?, district = ?, state = ?, pin_code = ?,
        register_number = ?, college_reg_no = ?, department_id = ?, course = ?, year = ?, section = ?, semester = ?, academic_year_id = ?,
        nss_unit_id = ?, joining_year = ?, student_phone = ?, student_email = ?, parent_name = ?, parent_phone = ?, emergency_contact = ?,
        nss_id = ?, volunteer_hours = ?, attendance_pct = ?, status = ?
       WHERE id = ?`,
      [
        fieldsToUpdate.full_name, fieldsToUpdate.dob, fieldsToUpdate.gender, fieldsToUpdate.blood_group, fieldsToUpdate.profile_photo,
        fieldsToUpdate.address, fieldsToUpdate.city, fieldsToUpdate.district, fieldsToUpdate.state, fieldsToUpdate.pin_code,
        fieldsToUpdate.register_number, fieldsToUpdate.college_reg_no, fieldsToUpdate.department_id, fieldsToUpdate.course,
        fieldsToUpdate.year, fieldsToUpdate.section, fieldsToUpdate.semester, fieldsToUpdate.academic_year_id,
        fieldsToUpdate.nss_unit_id, fieldsToUpdate.joining_year, fieldsToUpdate.student_phone, fieldsToUpdate.student_email,
        fieldsToUpdate.parent_name, fieldsToUpdate.parent_phone, fieldsToUpdate.emergency_contact,
        fieldsToUpdate.nss_id, fieldsToUpdate.volunteer_hours, fieldsToUpdate.attendance_pct, fieldsToUpdate.status,
        oldStudent.id
      ]
    );

    // Sync with users table if email, name, or profile photo changed
    if (fieldsToUpdate.student_email || fieldsToUpdate.full_name) {
      await query(
        `UPDATE users SET email = ?, status = ? WHERE user_id = ?`,
        [fieldsToUpdate.student_email, fieldsToUpdate.status === 'Approved' ? 'Active' : 'Inactive', oldStudent.user_id]
      );
    }

    // Record change log
    const changedFields = [];
    for (const key of Object.keys(fieldsToUpdate)) {
      if (String(fieldsToUpdate[key]) !== String(oldStudent[key])) {
        changedFields.push(`${key}: '${oldStudent[key]}' -> '${fieldsToUpdate[key]}'`);
      }
    }

    const logSummary = changedFields.length > 0
      ? `Admin updated student ${oldStudent.user_id} (${changedFields.join(', ')})`
      : `Admin updated profile for student ${oldStudent.user_id}`;

    await logActivity(req.user.user_id, req.user.email || req.user.user_id, req.user.role, logSummary, 'Student Management', req);

    // Notify Student
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')`,
      [oldStudent.user_id, 'Profile Updated by Admin', 'Your official student profile details were updated by the NSS Administrator.', 'info']
    );

    res.json({
      success: true,
      message: `Student details for ${fieldsToUpdate.full_name} updated successfully by Admin!`,
      student_id: oldStudent.id
    });

  } catch (err) {
    console.error('Admin edit student error:', err);
    res.status(500).json({ success: false, message: 'Failed to update student: ' + err.message });
  }
});

// 4. SUBMIT PROFILE UPDATE REQUEST (Students submit requested changes for Admin approval)
router.post('/profile/update-request', verifyToken, async (req, res) => {
  try {
    const { field_name, old_value, new_value, reason } = req.body;

    if (!field_name || !new_value || !reason) {
      return res.status(400).json({ success: false, message: 'Field name, requested value and reason are required.' });
    }

    const studentRes = await query(`SELECT id, nss_id FROM students WHERE user_id = ?`, [req.user.user_id]);
    if (studentRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const student = studentRes[0];

    await query(
      `INSERT INTO profile_update_requests (student_id, nss_id, field_name, old_value, new_value, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [student.id, student.nss_id, field_name, old_value || '', new_value, reason]
    );

    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'info')`,
      [req.user.user_id, 'Profile Correction Requested', `Your request to correct ${field_name} has been submitted to Admin for approval.`]
    );

    await logActivity(req.user.user_id, req.user.email || req.user.user_id, req.user.role, `Submitted profile correction request for field: ${field_name}`, 'Profile Update Requests', req);

    res.json({ success: true, message: 'Profile correction request submitted for Admin review!' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4.5 GET STUDENT'S OWN PROFILE UPDATE REQUESTS
router.get('/profile/update-requests', verifyToken, async (req, res) => {
  try {
    const studentRes = await query(`SELECT id FROM students WHERE user_id = ?`, [req.user.user_id]);
    if (studentRes.length === 0) {
      return res.json({ success: true, count: 0, requests: [] });
    }
    const studentId = studentRes[0].id;
    const requests = await query(
      `SELECT * FROM profile_update_requests WHERE student_id = ? ORDER BY created_at DESC`,
      [studentId]
    );
    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. GET ALL PROFILE UPDATE REQUESTS (Admin / PO view)
router.get('/update-requests/all', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const requests = await query(`
      SELECT r.*, s.full_name, s.register_number, s.student_email, s.user_id as student_user_id
      FROM profile_update_requests r
      JOIN students s ON r.student_id = s.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. ADMIN REVIEW PROFILE UPDATE REQUEST (Approve / Reject)
router.post('/update-requests/:id/review', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be Approved or Rejected.' });
    }

    const reqRes = await query(`SELECT r.*, s.user_id FROM profile_update_requests r JOIN students s ON r.student_id = s.id WHERE r.id = ?`, [id]);
    if (reqRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const updateReq = reqRes[0];

    if (updateReq.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This request has already been reviewed.' });
    }

    // Update Request Status
    await query(
      `UPDATE profile_update_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [action, req.user.user_id, id]
    );

    // If Approved, update actual Student record
    if (action === 'Approved') {
      const fieldMap = {
        'Full Name': 'full_name',
        'Date of Birth': 'dob',
        'Gender': 'gender',
        'Blood Group': 'blood_group',
        'Student Phone': 'student_phone',
        'Phone Number': 'student_phone',
        'Student Email': 'student_email',
        'Email': 'student_email',
        'Address': 'address',
        'City': 'city',
        'District': 'district',
        'State': 'state',
        'PIN Code': 'pin_code',
        'Register Number': 'register_number',
        'College Reg No': 'college_reg_no',
        'Department': 'department_id',
        'NSS Unit': 'nss_unit_id',
        'Year': 'year',
        'Section': 'section',
        'Parent Name': 'parent_name',
        'Parent Phone': 'parent_phone',
        'Emergency Contact': 'emergency_contact'
      };

      const dbField = fieldMap[updateReq.field_name] || updateReq.field_name.toLowerCase().replace(/ /g, '_');
      
      // Update student table
      await query(`UPDATE students SET ${dbField} = ? WHERE id = ?`, [updateReq.new_value, updateReq.student_id]);

      // Sync users table if email or name was updated
      if (dbField === 'student_email') {
        await query(`UPDATE users SET email = ? WHERE user_id = ?`, [updateReq.new_value, updateReq.user_id]);
      }
    }

    // Notify Student
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [updateReq.user_id, `Profile Request ${action}`, `Your profile correction request for ${updateReq.field_name} has been ${action.toLowerCase()}.`, action === 'Approved' ? 'success' : 'error']
    );

    await logActivity(
      req.user.user_id,
      req.user.email || req.user.user_id,
      req.user.role,
      `${action} profile correction request for student ${updateReq.nss_id} (Field: ${updateReq.field_name}, Old: '${updateReq.old_value}', New: '${updateReq.new_value}')`,
      'Profile Update Requests',
      req
    );

    res.json({ success: true, message: `Profile update request ${action.toLowerCase()} successfully!` });

  } catch (err) {
    console.error('Review update request error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. VERIFY STUDENT REGISTRATION (Admin / PO approves student registration)
router.post('/verify', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { student_id, action } = req.body; // action: 'Approved' or 'Rejected'

    const studentRes = await query(`SELECT * FROM students WHERE id = ?`, [student_id]);
    if (studentRes.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const student = studentRes[0];

    if (action === 'Approved') {
      const officialNssId = student.nss_id || student.user_id;

      await query(
        `UPDATE students SET status = 'Approved', nss_id = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [officialNssId, student_id]
      );
      await query(`UPDATE users SET status = 'Active' WHERE user_id = ?`, [student.user_id]);

      await query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')`,
        [student.user_id, 'Account Approved!', 'Your NSS Volunteer membership has been officially approved! You can now participate in NSS events.']
      );

      await logActivity(req.user.user_id, req.user.email || req.user.user_id, req.user.role, `Verified and Approved student registration for ${student.full_name} (${officialNssId})`, 'Student Management', req);

      res.json({ success: true, message: `Student ${student.full_name} verified and approved successfully!` });

    } else {
      await query(`UPDATE students SET status = 'Rejected' WHERE id = ?`, [student_id]);
      await query(`UPDATE users SET status = 'Inactive' WHERE user_id = ?`, [student.user_id]);

      await query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'error')`,
        [student.user_id, 'Registration Status', 'Your NSS registration was not approved. Please contact NSS Office.']
      );

      await logActivity(req.user.user_id, req.user.email || req.user.user_id, req.user.role, `Rejected student registration for ${student.full_name}`, 'Student Management', req);

      res.json({ success: true, message: `Student registration rejected.` });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. DELETE STUDENT
router.delete('/:id', verifyToken, checkRole(['Admin', 'Super Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const st = await query(`SELECT user_id, full_name FROM students WHERE id = ?`, [id]);
    if (st.length > 0) {
      await query(`DELETE FROM users WHERE user_id = ?`, [st[0].user_id]);
      await query(`DELETE FROM students WHERE id = ?`, [id]);
      await logActivity(req.user.user_id, req.user.email || req.user.user_id, req.user.role, `Deleted student account: ${st[0].full_name}`, 'Student Management', req);
    }
    res.json({ success: true, message: 'Student account deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
