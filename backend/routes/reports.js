const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// 1. GET DASHBOARD STATS AND ANALYTICS CHARTS DATA
router.get('/dashboard-stats', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    // Total Students Count
    const totalStRes = await query(`SELECT COUNT(*) as count FROM students`);
    const activeVolRes = await query(`SELECT COUNT(*) as count FROM students WHERE status = 'Approved'`);
    const pendingStRes = await query(`SELECT COUNT(*) as count FROM students WHERE status = 'Pending'`);

    // Pending Update Requests
    const pendingReqRes = await query(`SELECT COUNT(*) as count FROM profile_update_requests WHERE status = 'Pending'`);

    // Event Stats
    const totalEventsRes = await query(`SELECT COUNT(*) as count FROM events`);
    const upcomingEventsRes = await query(`SELECT COUNT(*) as count FROM events WHERE status IN ('Registration Open', 'Full', 'Upcoming')`);
    const completedEventsRes = await query(`SELECT COUNT(*) as count FROM events WHERE status = 'Completed'`);

    // Volunteer Hours & Certificates
    const totalHoursRes = await query(`SELECT SUM(hours) as sum_hours FROM volunteer_hours`);
    const totalCertsRes = await query(`SELECT COUNT(*) as count FROM certificates`);

    // Average Attendance %
    const avgAttRes = await query(`SELECT AVG(attendance_pct) as avg_pct FROM students WHERE status = 'Approved'`);

    // Chart Data 1: Students by Department
    const deptCharts = await query(`
      SELECT d.code as department, COUNT(s.id) as count
      FROM departments d
      LEFT JOIN students s ON d.id = s.department_id
      GROUP BY d.id, d.code
    `);

    // Chart Data 2: Students by Year
    const yearCharts = await query(`
      SELECT year, COUNT(*) as count FROM students GROUP BY year
    `);

    // Chart Data 3: NSS Unit Distribution
    const unitCharts = await query(`
      SELECT u.unit_code as unit, COUNT(s.id) as count
      FROM nss_units u
      LEFT JOIN students s ON u.id = s.nss_unit_id
      GROUP BY u.id, u.unit_code
    `);

    // Chart Data 4: Event Participation by Category
    const categoryCharts = await query(`
      SELECT category, COUNT(*) as count FROM events GROUP BY category
    `);

    // Chart Data 5: Monthly Volunteer Hours (Last 6 Months Mock/Live aggregation)
    const monthlyHoursCharts = [
      { month: 'Jan', hours: 120 },
      { month: 'Feb', hours: 180 },
      { month: 'Mar', hours: 240 },
      { month: 'Apr', hours: 310 },
      { month: 'May', hours: 290 },
      { month: 'Jun', hours: 420 },
      { month: 'Jul', hours: 380 },
      { month: 'Aug', hours: 510 },
      { month: 'Sep', hours: (totalHoursRes[0].sum_hours || 1240) }
    ];

    res.json({
      success: true,
      stats: {
        totalStudents: totalStRes[0].count || 0,
        activeVolunteers: activeVolRes[0].count || 0,
        pendingRegistrations: pendingStRes[0].count || 0,
        pendingUpdates: pendingReqRes[0].count || 0,
        totalEvents: totalEventsRes[0].count || 0,
        upcomingEvents: upcomingEventsRes[0].count || 0,
        completedEvents: completedEventsRes[0].count || 0,
        totalHours: totalHoursRes[0].sum_hours || 0,
        certificatesIssued: totalCertsRes[0].count || 0,
        avgAttendance: avgAttRes[0].avg_pct ? parseFloat(avgAttRes[0].avg_pct).toFixed(1) : 0
      },
      charts: {
        studentsByDepartment: deptCharts,
        studentsByYear: yearCharts,
        nssUnitDistribution: unitCharts,
        eventParticipation: categoryCharts,
        monthlyVolunteerHours: monthlyHoursCharts
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. EXPORT REPORT DATA (CSV formatted JSON)
router.get('/export-data', verifyToken, checkRole(['Admin', 'Super Admin', 'Programme Officer']), async (req, res) => {
  try {
    const { reportType } = req.query; // 'students', 'events', 'attendance', 'hours', 'certificates'

    let data = [];
    if (reportType === 'students') {
      data = await query(`
        SELECT s.nss_id, s.full_name, s.register_number, s.college_reg_no, d.name as department, s.year, s.section, u.unit_name, s.student_phone, s.student_email, s.total_events, s.volunteer_hours, s.attendance_pct, s.status
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN nss_units u ON s.nss_unit_id = u.id
      `);
    } else if (reportType === 'events') {
      data = await query(`
        SELECT e.event_name, e.category, e.event_date, e.event_time, e.venue, u.unit_name, e.max_participants, e.registered_count, e.hours_allocated, e.status
        FROM events e
        LEFT JOIN nss_units u ON e.nss_unit_id = u.id
      `);
    } else if (reportType === 'attendance') {
      data = await query(`
        SELECT att.nss_id, s.full_name, e.event_name, att.attendance_date, att.status, att.hours_awarded, att.marked_by
        FROM attendance att
        JOIN students s ON att.student_id = s.id
        JOIN events e ON att.event_id = e.id
      `);
    } else if (reportType === 'hours') {
      data = await query(`
        SELECT v.nss_id, s.full_name, e.event_name, v.hours, v.description, v.awarded_date
        FROM volunteer_hours v
        JOIN students s ON v.student_id = s.id
        LEFT JOIN events e ON v.event_id = e.id
      `);
    } else if (reportType === 'certificates') {
      data = await query(`
        SELECT c.certificate_number, c.certificate_name, c.nss_id, s.full_name, e.event_name, c.issue_date
        FROM certificates c
        JOIN students s ON c.student_id = s.id
        LEFT JOIN events e ON c.event_id = e.id
      `);
    }

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
