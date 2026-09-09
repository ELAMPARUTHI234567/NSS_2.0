import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Save, UserCheck, Clock } from 'lucide-react';

export default function AdminAttendancePage() {
  const { showToast } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursAwarded, setHoursAwarded] = useState(5);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.success) {
        setEvents(res.events || []);
        if (res.events.length > 0) {
          setSelectedEventId(res.events[0].id);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (selectedEventId) {
      loadRegisteredStudents(selectedEventId);
    }
  }, [selectedEventId]);

  const loadRegisteredStudents = async (eventId) => {
    try {
      const res = await api.get(`/attendance/event/${eventId}/registrations`);
      if (res.success) {
        setStudents(res.students || []);
        const ev = events.find(e => String(e.id) === String(eventId));
        if (ev) setHoursAwarded(ev.hours_allocated || 5);

        // Pre-fill attendance map with Present by default
        const initialMap = {};
        (res.students || []).forEach(s => {
          initialMap[s.student_id] = { status: s.attendance_status || 'Present', hours: s.hours_awarded || (ev?.hours_allocated || 5) };
        });
        setAttendanceMap(initialMap);
      }
    } catch (err) {}
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status, hours: status === 'Present' ? hoursAwarded : 0 }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.student_id] = { status, hours: status === 'Present' ? hoursAwarded : 0 };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceList = Object.entries(attendanceMap).map(([studentId, data]) => ({
        student_id: parseInt(studentId),
        status: data.status,
        hours_awarded: data.status === 'Present' ? parseFloat(data.hours) : 0
      }));

      const payload = {
        eventId: parseInt(selectedEventId),
        attendanceDate,
        attendanceList
      };

      const res = await api.post('/attendance/mark-bulk', payload);
      if (res.success) {
        showToast(res.message, 'success');
        loadRegisteredStudents(selectedEventId);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Event Attendance & Volunteer Hours Marking</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Select an event, mark attendance status, and credit accredited volunteer hours</p>
        </div>

        <button className="btn btn-success" onClick={handleSaveAttendance} disabled={saving || students.length === 0}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save & Mark Attendance'}
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Select NSS Event *</label>
          <select className="form-control" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.event_name} ({e.event_date}) — {e.category}</option>
            ))}
          </select>
        </div>

        <div style={{ width: '180px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Attendance Date *</label>
          <input type="date" className="form-control" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
        </div>

        <div style={{ width: '160px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Hours Awarded *</label>
          <input type="number" className="form-control" value={hoursAwarded} onChange={e => setHoursAwarded(e.target.value)} />
        </div>

        <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => handleMarkAll('Present')} style={{ fontSize: '0.8rem' }}>Mark All Present</button>
          <button className="btn btn-outline" onClick={() => handleMarkAll('Absent')} style={{ fontSize: '0.8rem' }}>Mark All Absent</button>
        </div>
      </div>

      {/* Registered Students Attendance Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>NSS ID</th>
              <th>Student Name</th>
              <th>Register No</th>
              <th>Department</th>
              <th>Year</th>
              <th>Attendance Status</th>
              <th>Hours Awarded</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  No students registered for the selected event.
                </td>
              </tr>
            ) : (
              students.map(s => {
                const currentData = attendanceMap[s.student_id] || { status: 'Present', hours: hoursAwarded };
                return (
                  <tr key={s.student_id}>
                    <td style={{ fontWeight: 800, color: '#1d4ed8' }}>{s.nss_id}</td>
                    <td style={{ fontWeight: 700 }}>{s.full_name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.register_number}</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.department_code}</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.year}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className={`btn ${currentData.status === 'Present' ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => handleStatusChange(s.student_id, 'Present')}
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={`btn ${currentData.status === 'Absent' ? 'btn-danger' : 'btn-outline'}`}
                          onClick={() => handleStatusChange(s.student_id, 'Absent')}
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: currentData.status === 'Present' ? '#059669' : '#94a3b8' }}>
                      {currentData.status === 'Present' ? `${currentData.hours} hrs` : '0 hrs'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
