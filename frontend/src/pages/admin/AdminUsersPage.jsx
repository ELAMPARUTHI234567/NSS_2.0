import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Users, UserPlus, Shield, Key, Trash2 } from 'lucide-react';

export default function AdminUsersPage() {
  const { showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    user_id: '',
    email: '',
    password: 'password123',
    role: 'Programme Officer',
    fullName: '',
    phone: '',
    nssUnitId: '1'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.success) setUsers(res.users || []);
    } catch (err) {}
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', form);
      if (res.success) {
        showToast(res.message, 'success');
        setCreateModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (userId, status) => {
    try {
      const newStatus = status === 'Active' ? 'Inactive' : 'Active';
      const res = await api.put(`/users/${userId}/status`, { status: newStatus });
      if (res.success) {
        showToast(res.message, 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>User & Access Role Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage administrative accounts, Programme Officers, and access privileges</p>
        </div>

        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 800, color: '#1d4ed8' }}>{u.user_id}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role === 'Super Admin' ? 'danger' : u.role === 'Admin' ? 'warning' : u.role === 'Programme Officer' ? 'info' : 'success'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${u.status}`}>● {u.status}</span>
                </td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn ${u.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggleStatus(u.id, u.status)}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Admin / Programme Officer User">
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>User Role *</label>
            <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="Programme Officer">Programme Officer</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>User ID *</label>
            <input type="text" className="form-control" placeholder="e.g. NSSPO002 or ADMIN002" value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" className="form-control" placeholder="Enter full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" className="form-control" placeholder="user@college.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create User Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
