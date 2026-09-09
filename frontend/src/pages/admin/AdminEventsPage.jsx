import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Calendar, Plus, Users, Edit, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminEventsPage() {
  const { showToast } = useAuth();
  const [events, setEvents] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [registeredStudentsModal, setRegisteredStudentsModal] = useState(null);
  const [registeredList, setRegisteredList] = useState([]);

  const [form, setForm] = useState({
    eventName: '',
    description: '',
    category: 'Environmental Care',
    eventDate: '2026-09-25',
    eventTime: '09:00 AM',
    venue: 'College Main Campus Grounds',
    nssUnitId: '1',
    maxParticipants: 100,
    hoursAllocated: 5,
    registrationDeadline: '2026-09-24',
    instructions: 'Wear NSS uniform badge, bring water bottle',
    eventPoster: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.success) setEvents(res.events || []);
    } catch (err) {}
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/events', form);
      if (res.success) {
        showToast(res.message, 'success');
        setCreateModalOpen(false);
        fetchEvents();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateStatus = async (eventId, status) => {
    try {
      const res = await api.put(`/events/${eventId}/status`, { status });
      if (res.success) {
        showToast(res.message, 'success');
        fetchEvents();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleViewRegistered = async (ev) => {
    try {
      const res = await api.get(`/events/${ev.id}/registrations`);
      if (res.success) {
        setRegisteredList(res.registrations || []);
        setRegisteredStudentsModal(ev);
      }
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>NSS Event Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Publish new community service events, set seat limits, track registrations</p>
        </div>

        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} /> Create New Event
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {events.map(ev => (
          <div key={ev.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img src={ev.event_poster} alt={ev.event_name} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-info">{ev.category}</span>
                <span className={`badge badge-${ev.status.replace(/\s+/g, '-')}`}>{ev.status}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0' }}>{ev.event_name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', flex: 1, marginBottom: '1rem' }}>{ev.description.substring(0, 90)}...</p>

              <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>📅 <strong>Date:</strong> {ev.event_date} ({ev.event_time})</div>
                <div>📍 <strong>Venue:</strong> {ev.venue}</div>
                <div>🏆 <strong>Allocated Hours:</strong> {ev.hours_allocated} Hrs</div>
                <div>👥 <strong>Registered:</strong> {ev.registered_count} / {ev.max_participants}</div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button className="btn btn-outline" onClick={() => handleViewRegistered(ev)} style={{ flex: 1, fontSize: '0.8rem' }}>
                  <Users size={14} /> View Enrolled
                </button>
                {ev.status === 'Registration Open' && (
                  <button className="btn btn-success" onClick={() => handleUpdateStatus(ev.id, 'Completed')} style={{ flex: 1, fontSize: '0.8rem' }}>
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE EVENT MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New NSS Event">
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label>Event Name *</label>
            <input type="text" className="form-control" placeholder="e.g. Tree Plantation Drive 2026" value={form.eventName} onChange={e => setForm({ ...form, eventName: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="Environmental Care">Environmental Care</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Swachh Bharat">Swachh Bharat</option>
                <option value="Awareness Rally">Awareness Rally</option>
                <option value="Community Service">Community Service</option>
              </select>
            </div>
            <div className="form-group">
              <label>NSS Unit *</label>
              <select className="form-control" value={form.nssUnitId} onChange={e => setForm({ ...form, nssUnitId: e.target.value })}>
                <option value="1">NSS Unit I</option>
                <option value="2">NSS Unit II</option>
                <option value="3">NSS Unit III</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label>Event Date *</label>
              <input type="date" className="form-control" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Event Time *</label>
              <input type="text" className="form-control" placeholder="09:00 AM" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Venue *</label>
            <input type="text" className="form-control" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label>Max Seats *</label>
              <input type="number" className="form-control" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Volunteer Hours Allocated *</label>
              <input type="number" className="form-control" value={form.hoursAllocated} onChange={e => setForm({ ...form, hoursAllocated: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea className="form-control" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
          </div>

          <div className="form-group">
            <label>Poster Image URL</label>
            <input type="text" className="form-control" value={form.eventPoster} onChange={e => setForm({ ...form, eventPoster: e.target.value })} />
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Event</button>
          </div>
        </form>
      </Modal>

      {/* VIEW REGISTERED STUDENTS MODAL */}
      <Modal isOpen={!!registeredStudentsModal} onClose={() => setRegisteredStudentsModal(null)} title={`Enrolled Volunteers — ${registeredStudentsModal?.event_name}`}>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>NSS ID</th>
                <th>Student Name</th>
                <th>Register No</th>
                <th>Dept</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {registeredList.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 800, color: '#1d4ed8' }}>{r.nss_id}</td>
                  <td style={{ fontWeight: 700 }}>{r.full_name}</td>
                  <td>{r.register_number}</td>
                  <td>{r.department_code}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.registration_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
