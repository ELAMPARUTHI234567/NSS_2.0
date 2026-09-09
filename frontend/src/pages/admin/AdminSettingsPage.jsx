import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Settings, Plus, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [nssUnits, setNssUnits] = useState([]);
  const [settings, setSettings] = useState({});

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);

  const [deptForm, setDeptForm] = useState({ code: '', name: '' });
  const [unitForm, setUnitForm] = useState({ unit_code: '', unit_name: '', po_name: '', capacity: 100 });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success) {
        setDepartments(res.departments || []);
        setNssUnits(res.nssUnits || []);
        setSettings(res.settings || {});
      }
    } catch (err) {}
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/settings/departments', deptForm);
      if (res.success) {
        showToast(res.message, 'success');
        setDeptModalOpen(false);
        setDeptForm({ code: '', name: '' });
        fetchSettings();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/settings/nss-units', unitForm);
      if (res.success) {
        showToast(res.message, 'success');
        setUnitModalOpen(false);
        setUnitForm({ unit_code: '', unit_name: '', po_name: '', capacity: 100 });
        fetchSettings();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await api.put('/settings', { settings });
      if (res.success) {
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>System Configuration & Master Data</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Configure college departments, NSS units, academic years, and global portal rules</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Departments List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Academic Departments</h3>
            <button className="btn btn-outline" onClick={() => setDeptModalOpen(true)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              <Plus size={14} /> Add Department
            </button>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 800, color: '#1d4ed8' }}>{d.code}</td>
                  <td>{d.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NSS Units List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>NSS College Units</h3>
            <button className="btn btn-outline" onClick={() => setUnitModalOpen(true)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              <Plus size={14} /> Add NSS Unit
            </button>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Unit Code</th>
                <th>Unit Name</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {nssUnits.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 800, color: '#059669' }}>{u.unit_code}</td>
                  <td>{u.unit_name}</td>
                  <td>{u.capacity} Seats</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Settings Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Global Portal Rules & Thresholds</h3>
          <button className="btn btn-primary" onClick={handleSaveSettings}>
            <Save size={16} /> Save Portal Rules
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Required Annual Volunteer Hours for Certificate</label>
            <input
              type="number"
              className="form-control"
              value={settings.required_hours || 120}
              onChange={e => setSettings({ ...settings, required_hours: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Minimum Attendance % Threshold</label>
            <input
              type="number"
              className="form-control"
              value={settings.attendance_threshold || 80}
              onChange={e => setSettings({ ...settings, attendance_threshold: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Academic Year Tag</label>
            <input
              type="text"
              className="form-control"
              value={settings.academic_year || '2025-2026'}
              onChange={e => setSettings({ ...settings, academic_year: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* CREATE DEPT MODAL */}
      <Modal isOpen={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="Create New Department">
        <form onSubmit={handleCreateDept}>
          <div className="form-group">
            <label>Department Code (e.g. CSE, IT, MECH) *</label>
            <input type="text" className="form-control" value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Full Department Name *</label>
            <input type="text" className="form-control" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} required />
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setDeptModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Department</button>
          </div>
        </form>
      </Modal>

      {/* CREATE UNIT MODAL */}
      <Modal isOpen={unitModalOpen} onClose={() => setUnitModalOpen(false)} title="Create New NSS Unit">
        <form onSubmit={handleCreateUnit}>
          <div className="form-group">
            <label>Unit Code (e.g. UNIT-1) *</label>
            <input type="text" className="form-control" value={unitForm.unit_code} onChange={e => setUnitForm({ ...unitForm, unit_code: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Unit Name *</label>
            <input type="text" className="form-control" value={unitForm.unit_name} onChange={e => setUnitForm({ ...unitForm, unit_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Programme Officer Name</label>
            <input type="text" className="form-control" value={unitForm.po_name} onChange={e => setUnitForm({ ...unitForm, po_name: e.target.value })} />
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setUnitModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create NSS Unit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
