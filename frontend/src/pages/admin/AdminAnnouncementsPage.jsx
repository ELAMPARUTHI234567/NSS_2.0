import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Megaphone, Plus, Trash2 } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const { showToast } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'General',
    attachment: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      if (res.success) setAnnouncements(res.announcements || []);
    } catch (err) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements', form);
      if (res.success) {
        showToast(res.message, 'success');
        setCreateModalOpen(false);
        fetchAnnouncements();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.success) {
        showToast(res.message, 'info');
        fetchAnnouncements();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Announcements & Circulars</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Publish notifications, orientation schedules, and urgent notices to student dashboards</p>
        </div>

        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} /> New Announcement
        </button>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Priority</th>
              <th>Title</th>
              <th>Category</th>
              <th>Publish Date</th>
              <th>Published By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(a => (
              <tr key={a.id}>
                <td>#{a.id}</td>
                <td><span className={`badge badge-${a.priority}`}>● {a.priority}</span></td>
                <td style={{ fontWeight: 700 }}>{a.title}</td>
                <td><span className="badge badge-info">{a.category}</span></td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(a.publish_date).toLocaleString()}</td>
                <td style={{ fontSize: '0.85rem' }}>{a.published_by}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(a.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Publish New Announcement">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Announcement Title *</label>
            <input type="text" className="form-control" placeholder="e.g. Mandatory NSS Special Camp Orientation" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label>Priority Tag *</label>
              <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="Urgent">🔴 Urgent</option>
                <option value="Important">🟠 Important</option>
                <option value="General">🔵 General</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="General">General Notice</option>
                <option value="Event Circular">Event Circular</option>
                <option value="Camp Orientation">Camp Orientation</option>
                <option value="Blood Donation">Blood Donation</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description Content *</label>
            <textarea className="form-control" rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Announcement</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
