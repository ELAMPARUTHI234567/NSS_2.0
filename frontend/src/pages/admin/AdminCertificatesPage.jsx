import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { FileText, Plus, Download } from 'lucide-react';

export default function AdminCertificatesPage() {
  const { showToast } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    certificateName: 'Certificate of Appreciation — Blood Donation Camp',
    studentId: '',
    eventId: '',
    issueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCertificates();
    api.get('/students?status=Approved').then(res => {
      if (res.success) {
        setStudents(res.students || []);
        if (res.students.length > 0) setForm(f => ({ ...f, studentId: res.students[0].id }));
      }
    }).catch(() => {});
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates');
      if (res.success) setCertificates(res.certificates || []);
    } catch (err) {}
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/certificates/upload', form);
      if (res.success) {
        showToast(res.message, 'success');
        setCreateModalOpen(false);
        fetchCertificates();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>NSS Certificate Generation & Issuance</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Issue appreciation certificates and certificates of completion to approved volunteers</p>
        </div>

        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} /> Issue Certificate
        </button>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Certificate No</th>
              <th>Certificate Title</th>
              <th>Student Name</th>
              <th>NSS ID</th>
              <th>Register No</th>
              <th>Issue Date</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 800, color: '#1d4ed8' }}>{c.certificate_number}</td>
                <td style={{ fontWeight: 700 }}>{c.certificate_name}</td>
                <td style={{ fontWeight: 600 }}>{c.full_name}</td>
                <td style={{ fontSize: '0.85rem' }}>{c.nss_id}</td>
                <td style={{ fontSize: '0.85rem' }}>{c.register_number}</td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.issue_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Issue Official NSS Certificate">
        <form onSubmit={handleIssueCertificate}>
          <div className="form-group">
            <label>Select Volunteer Student *</label>
            <select className="form-control" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.nss_id}) — {s.register_number}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Certificate Title *</label>
            <input type="text" className="form-control" value={form.certificateName} onChange={e => setForm({ ...form, certificateName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Issue Date *</label>
            <input type="date" className="form-control" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} required />
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Issue & Publish Certificate</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
