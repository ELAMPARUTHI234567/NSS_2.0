import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Award, Plus, Medal } from 'lucide-react';

export default function AdminAchievementsPage() {
  const { showToast } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: 'Best Volunteer Award 2026',
    studentId: '',
    awardType: 'Gold Medal',
    description: 'Outstanding dedication and logging over 100 volunteer hours.',
    awardDate: new Date().toISOString().split('T')[0],
    givenBy: 'NSS Central Advisory Committee'
  });

  useEffect(() => {
    fetchAchievements();
    api.get('/students?status=Approved').then(res => {
      if (res.success) {
        setStudents(res.students || []);
        if (res.students.length > 0) setForm(f => ({ ...f, studentId: res.students[0].id }));
      }
    }).catch(() => {});
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await api.get('/achievements');
      if (res.success) setAchievements(res.achievements || []);
    } catch (err) {}
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/achievements', form);
      if (res.success) {
        showToast(res.message, 'success');
        setCreateModalOpen(false);
        fetchAchievements();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Achievements & Awards Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Grant honors, Best Volunteer awards, and blood donation badges</p>
        </div>

        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} /> Grant Award
        </button>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Award Title</th>
              <th>Award Type</th>
              <th>Recipient Student</th>
              <th>NSS ID</th>
              <th>Award Date</th>
              <th>Given By</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map(a => (
              <tr key={a.id}>
                <td>#{a.id}</td>
                <td style={{ fontWeight: 700 }}>{a.title}</td>
                <td><span className="badge badge-warning">{a.award_type}</span></td>
                <td style={{ fontWeight: 600 }}>{a.full_name}</td>
                <td style={{ fontSize: '0.85rem' }}>{a.nss_id}</td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{a.award_date}</td>
                <td style={{ fontSize: '0.85rem' }}>{a.given_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Grant Award / Achievement">
        <form onSubmit={handleAddAchievement}>
          <div className="form-group">
            <label>Select Volunteer Student *</label>
            <select className="form-control" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.nss_id}) — {s.register_number}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Award Title *</label>
            <input type="text" className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label>Award Type *</label>
              <select className="form-control" value={form.awardType} onChange={e => setForm({ ...form, awardType: e.target.value })}>
                <option value="Best Volunteer">Best Volunteer</option>
                <option value="Gold Medal">Gold Medal</option>
                <option value="Star Performer">Star Performer</option>
                <option value="Blood Donor Badge">Blood Donor Badge</option>
              </select>
            </div>
            <div className="form-group">
              <label>Award Date *</label>
              <input type="date" className="form-control" value={form.awardDate} onChange={e => setForm({ ...form, awardDate: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Award Description</label>
            <textarea className="form-control" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Grant Award</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
