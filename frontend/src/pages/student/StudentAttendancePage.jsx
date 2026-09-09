import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { CheckSquare, Clock, Award } from 'lucide-react';

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ totalEvents: 0, presentCount: 0, totalHours: 0, pct: '0.00' });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      if (res.success) {
        setAttendance(res.attendance || []);
        setSummary(res.summary || { totalEvents: 0, presentCount: 0, totalHours: 0, pct: '0.00' });
      }
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Attendance & Volunteer Hours Log</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Comprehensive history of verified attendance and accredited volunteer hours</p>
      </div>

      {/* Summary Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Registered Events</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>{summary.totalEvents}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <CheckSquare size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Events Attended</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: '#059669' }}>{summary.presentCount}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckSquare size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Accredited Hours</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: '#d97706' }}>{summary.totalHours} hrs</h3>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Overall Attendance %</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem', color: '#0284c7' }}>{summary.pct}%</h3>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <Award size={22} />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event Name</th>
              <th>Category</th>
              <th>Attendance Status</th>
              <th>Hours Awarded</th>
              <th>Marked By</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  No attendance records logged yet.
                </td>
              </tr>
            ) : (
              attendance.map(att => (
                <tr key={att.id}>
                  <td style={{ fontSize: '0.85rem' }}>{att.attendance_date}</td>
                  <td style={{ fontWeight: 700 }}>{att.event_name}</td>
                  <td><span className="badge badge-info">{att.category}</span></td>
                  <td>
                    <span className={`badge badge-${att.status}`}>
                      ● {att.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#059669' }}>{att.hours_awarded} hrs</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{att.marked_by}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
