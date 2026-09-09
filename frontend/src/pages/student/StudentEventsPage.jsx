import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Calendar, MapPin, CheckCircle, Clock, Award } from 'lucide-react';

export default function StudentEventsPage() {
  const { showToast } = useAuth();
  const [tab, setTab] = useState('available');
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.success) setEvents(res.events || []);
    } catch (err) {}
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get('/events/my/registrations');
      if (res.success) setMyRegistrations(res.registrations || []);
    } catch (err) {}
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.success) {
        showToast(res.message, 'success');
        fetchEvents();
        fetchMyRegistrations();
        setSelectedEvent(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const myRegisteredEventIds = new Set(myRegistrations.map(r => r.event_id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>NSS Events & Registrations</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Browse campus activities and track your registered participation</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${tab === 'available' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('available')}
          >
            Available Events ({events.length})
          </button>
          <button
            className={`btn ${tab === 'my' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('my')}
          >
            My Registrations ({myRegistrations.length})
          </button>
        </div>
      </div>

      {tab === 'available' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {events.map(ev => {
            const isReg = myRegisteredEventIds.has(ev.id);
            return (
              <div key={ev.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={ev.event_poster} alt={ev.event_name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-info">{ev.category}</span>
                    <span className={`badge badge-${ev.status.replace(/\s+/g, '-')}`}>{ev.status}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.35rem 0' }}>{ev.event_name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', flex: 1, marginBottom: '1rem' }}>{ev.description.substring(0, 100)}...</p>

                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>📅 <strong>Date:</strong> {ev.event_date} ({ev.event_time})</div>
                    <div>📍 <strong>Venue:</strong> {ev.venue}</div>
                    <div>🏆 <strong>Hours:</strong> {ev.hours_allocated} Hrs</div>
                    <div>👥 <strong>Seats:</strong> {ev.registered_count} / {ev.max_participants}</div>
                  </div>

                  {isReg ? (
                    <button className="btn btn-success" disabled style={{ width: '100%' }}>
                      <CheckCircle size={16} /> Registered
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleRegister(ev.id)}
                      disabled={ev.status !== 'Registration Open' || ev.registered_count >= ev.max_participants}
                      style={{ width: '100%' }}
                    >
                      {ev.registered_count >= ev.max_participants ? 'Seats Full' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Category</th>
                <th>Event Date & Time</th>
                <th>Venue</th>
                <th>Registration Date</th>
                <th>Attendance</th>
                <th>Hours Earned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    You have not registered for any events yet.
                  </td>
                </tr>
              ) : (
                myRegistrations.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.event_name}</td>
                    <td><span className="badge badge-info">{r.category}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{r.event_date} ({r.event_time})</td>
                    <td style={{ fontSize: '0.85rem' }}>{r.venue}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.registration_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${r.attendance_status}`}>
                        {r.attendance_status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>{r.hours_awarded} hrs</td>
                    <td>
                      <span className={`badge badge-${r.status}`}>● {r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
