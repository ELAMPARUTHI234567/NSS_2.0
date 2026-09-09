import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import ExportButtons from '../../components/ExportButtons';
import { Search, UserCheck, XCircle, CheckCircle, Edit2, Trash2, Shield, Eye, AlertCircle, RefreshCw, Plus, User, Camera, Award } from 'lucide-react';

export default function AdminStudentsPage() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'requests'
  const [students, setStudents] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [nssUnits, setNssUnits] = useState([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [viewStudentModal, setViewStudentModal] = useState(null);
  const [editStudentModal, setEditStudentModal] = useState(null);
  const [verifyModalStudent, setVerifyModalStudent] = useState(null);

  // Edit Student Form State
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    dob: '',
    gender: 'Male',
    blood_group: 'O+',
    profile_photo: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pin_code: '',
    register_number: '',
    college_reg_no: '',
    department_id: '',
    course: '',
    year: '1st Year',
    section: 'A',
    semester: 'Semester 1',
    nss_unit_id: '',
    joining_year: 2026,
    student_phone: '',
    student_email: '',
    parent_name: '',
    parent_phone: '',
    emergency_contact: '',
    nss_id: '',
    volunteer_hours: 0,
    attendance_pct: 100,
    status: 'Approved'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchRequests();
    api.get('/settings').then(res => {
      if (res.success) {
        setDepartments(res.departments || []);
        setNssUnits(res.nssUnits || []);
      }
    }).catch(() => {});
  }, [statusFilter, deptFilter]);

  const fetchStudents = async () => {
    try {
      let queryUrl = '/students?';
      if (statusFilter) queryUrl += `status=${statusFilter}&`;
      if (deptFilter) queryUrl += `department_id=${deptFilter}&`;
      const res = await api.get(queryUrl);
      if (res.success) setStudents(res.students || []);
    } catch (err) {
      console.error('Fetch students error:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/students/update-requests/all');
      if (res.success) setUpdateRequests(res.requests || []);
    } catch (err) {
      console.error('Fetch requests error:', err);
    }
  };

  const handleOpenEditModal = (student) => {
    setEditStudentModal(student);
    setEditFormData({
      full_name: student.full_name || '',
      dob: student.dob || '',
      gender: student.gender || 'Male',
      blood_group: student.blood_group || 'O+',
      profile_photo: student.profile_photo || '',
      address: student.address || '',
      city: student.city || '',
      district: student.district || '',
      state: student.state || '',
      pin_code: student.pin_code || '',
      register_number: student.register_number || '',
      college_reg_no: student.college_reg_no || '',
      department_id: student.department_id || '',
      course: student.course || 'B.Tech IT',
      year: student.year || '1st Year',
      section: student.section || 'A',
      semester: student.semester || 'Semester 1',
      nss_unit_id: student.nss_unit_id || '',
      joining_year: student.joining_year || 2026,
      student_phone: student.student_phone || '',
      student_email: student.student_email || '',
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      emergency_contact: student.emergency_contact || '',
      nss_id: student.nss_id || '',
      volunteer_hours: student.volunteer_hours || 0,
      attendance_pct: student.attendance_pct || 100,
      status: student.status || 'Approved'
    });
  };

  const handleSaveEditStudent = async (e) => {
    e.preventDefault();
    if (!editStudentModal) return;
    setSaving(true);
    try {
      const res = await api.put(`/students/${editStudentModal.id}`, editFormData);
      if (res.success) {
        showToast(res.message, 'success');
        setEditStudentModal(null);
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update student details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyStudent = async (studentId, action) => {
    try {
      const res = await api.post('/students/verify', { student_id: studentId, action });
      if (res.success) {
        showToast(res.message, 'success');
        setVerifyModalStudent(null);
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message || 'Verification action failed.', 'error');
    }
  };

  const handleReviewRequest = async (requestId, action) => {
    try {
      const res = await api.post(`/students/update-requests/${requestId}/review`, { action });
      if (res.success) {
        showToast(res.message, 'success');
        fetchRequests();
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message || 'Review failed.', 'error');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student account: ${studentName}?`)) return;
    try {
      const res = await api.delete(`/students/${studentId}`);
      if (res.success) {
        showToast(res.message, 'success');
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    }
  };

  const filteredStudents = students.filter(s =>
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.register_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.nss_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.student_email || '').toLowerCase().includes(search.toLowerCase())
  );

  const pendingRequestsCount = updateRequests.filter(r => r.status === 'Pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>NSS Student Directory & Profile Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Direct Admin control over student master records, profile photos, and student correction request approvals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('students')} style={{ background: activeTab === 'students' ? '#1e3a8a' : 'white' }}>
            Volunteer Roster ({students.length})
          </button>
          <button className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('requests')} style={{ background: activeTab === 'requests' ? '#1e3a8a' : 'white', position: 'relative' }}>
            Correction Requests {pendingRequestsCount > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', marginLeft: '0.5rem', fontWeight: 800 }}>{pendingRequestsCount}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* Filter Bar & Export */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', background: 'white', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search by Name, Reg No, NSS ID, Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select className="input-field" style={{ width: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending Verification</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select className="input-field" style={{ width: '180px' }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>

            <ExportButtons data={filteredStudents} filename="NSS_Student_Volunteers" title="NSS Volunteer Roster" />
          </div>

          {/* Students Table */}
          <div className="table-responsive" style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>NSS ID</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student Name</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Reg No</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Dept & Course</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Year & Sec</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>NSS Unit</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Hours</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Att %</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                      No student records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ fontWeight: 800, color: '#1e3a8a', padding: '0.85rem 1rem' }}>{s.nss_id || s.user_id}</td>
                      <td style={{ fontWeight: 700, padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={s.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'; }}
                          />
                          <div>
                            <div>{s.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{s.student_email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', padding: '0.85rem 1rem' }}>{s.register_number}</td>
                      <td style={{ fontSize: '0.85rem', padding: '0.85rem 1rem' }}>{s.department_code || s.department_name} ({s.course})</td>
                      <td style={{ fontSize: '0.85rem', padding: '0.85rem 1rem' }}>{s.year} ({s.section})</td>
                      <td style={{ fontSize: '0.85rem', padding: '0.85rem 1rem' }}>{s.unit_name || s.unit_code}</td>
                      <td style={{ fontWeight: 800, color: '#16a34a', textAlign: 'center', padding: '0.85rem 1rem' }}>{s.volunteer_hours} h</td>
                      <td style={{ fontWeight: 800, color: '#d97706', textAlign: 'center', padding: '0.85rem 1rem' }}>{s.attendance_pct}%</td>
                      <td style={{ textAlign: 'center', padding: '0.85rem 1rem' }}>
                        <span className={`badge badge-${s.status === 'Approved' ? 'success' : s.status === 'Pending' ? 'warning' : 'danger'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => setViewStudentModal(s)}
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            title="View Full Profile"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleOpenEditModal(s)}
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', background: '#1e3a8a' }}
                            title="Direct Admin Edit All Details"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          {s.status === 'Pending' && (
                            <button
                              className="btn btn-success"
                              onClick={() => setVerifyModalStudent(s)}
                              style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                              title="Verify Registration"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                          <button
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', padding: '0.35rem 0.55rem', cursor: 'pointer' }}
                            onClick={() => handleDeleteStudent(s.id, s.full_name)}
                            title="Delete Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Requests Tab */
        <div className="table-responsive" style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Req ID</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student Details</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Field Requested</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Current Old Value</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Requested New Value</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Admin Review Action</th>
              </tr>
            </thead>
            <tbody>
              {updateRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                    No student profile update correction requests pending.
                  </td>
                </tr>
              ) : (
                updateRequests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ fontWeight: 800, padding: '0.85rem 1rem' }}>#{r.id}</td>
                    <td style={{ fontWeight: 700, padding: '0.85rem 1rem' }}>
                      <div>{r.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reg: {r.register_number}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a', padding: '0.85rem 1rem' }}>{r.field_name}</td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem', padding: '0.85rem 1rem' }}>{r.old_value || 'Empty / Unset'}</td>
                    <td style={{ fontWeight: 800, color: '#1e3a8a', padding: '0.85rem 1rem' }}>{r.new_value}</td>
                    <td style={{ fontSize: '0.85rem', color: '#334155', padding: '0.85rem 1rem' }}>{r.reason}</td>
                    <td style={{ textAlign: 'center', padding: '0.85rem 1rem' }}>
                      <span className={`badge badge-${r.status === 'Approved' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {r.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-success" onClick={() => handleReviewRequest(r.id, 'Approved')} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                            Approve
                          </button>
                          <button className="btn btn-danger" onClick={() => handleReviewRequest(r.id, 'Rejected')} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW STUDENT PROFILE MODAL */}
      {viewStudentModal && (
        <Modal isOpen={!!viewStudentModal} onClose={() => setViewStudentModal(null)} title="Student Profile Inspection">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
              <img
                src={viewStudentModal.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt=""
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1e3a8a' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{viewStudentModal.full_name}</h3>
                <p style={{ color: '#1e3a8a', fontWeight: 700, margin: '0.2rem 0' }}>NSS ID: {viewStudentModal.nss_id || viewStudentModal.user_id}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>{viewStudentModal.course} — Reg No: {viewStudentModal.register_number}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div><strong>Email:</strong> {viewStudentModal.student_email}</div>
              <div><strong>Phone:</strong> {viewStudentModal.student_phone}</div>
              <div><strong>Department:</strong> {viewStudentModal.department_name}</div>
              <div><strong>NSS Unit:</strong> {viewStudentModal.unit_name}</div>
              <div><strong>Year & Section:</strong> {viewStudentModal.year} ({viewStudentModal.section})</div>
              <div><strong>Semester:</strong> {viewStudentModal.semester}</div>
              <div><strong>Date of Birth:</strong> {viewStudentModal.dob}</div>
              <div><strong>Blood Group:</strong> {viewStudentModal.blood_group}</div>
              <div><strong>Parent:</strong> {viewStudentModal.parent_name} ({viewStudentModal.parent_phone})</div>
              <div><strong>Emergency Contact:</strong> {viewStudentModal.emergency_contact}</div>
            </div>

            <div style={{ background: '#e0f2fe', padding: '0.85rem 1.25rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 800 }}>VOLUNTEER HOURS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f2b5c' }}>{viewStudentModal.volunteer_hours} hrs</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 800 }}>ATTENDANCE RATE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f2b5c' }}>{viewStudentModal.attendance_pct}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setViewStudentModal(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { const s = viewStudentModal; setViewStudentModal(null); handleOpenEditModal(s); }} style={{ background: '#1e3a8a' }}>
                <Edit2 size={16} /> Edit Student Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADMIN DIRECT EDIT STUDENT MODAL */}
      {editStudentModal && (
        <Modal isOpen={!!editStudentModal} onClose={() => setEditStudentModal(null)} title={`Direct Edit Student: ${editStudentModal.full_name}`}>
          <form onSubmit={handleSaveEditStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
              🛡️ Admin Privilege: Any changes saved here will immediately update the student's master database record.
            </div>

            {/* Photo & Main Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Full Name *</label>
                <input type="text" className="input-field" value={editFormData.full_name} onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Profile Photo URL</label>
                <input type="url" className="input-field" placeholder="https://images.unsplash.com/..." value={editFormData.profile_photo} onChange={(e) => setEditFormData({ ...editFormData, profile_photo: e.target.value })} />
              </div>
            </div>

            {/* Contact & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Student Email *</label>
                <input type="email" className="input-field" value={editFormData.student_email} onChange={(e) => setEditFormData({ ...editFormData, student_email: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Student Phone *</label>
                <input type="text" className="input-field" value={editFormData.student_phone} onChange={(e) => setEditFormData({ ...editFormData, student_phone: e.target.value })} required />
              </div>
            </div>

            {/* Numbers & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Register Number *</label>
                <input type="text" className="input-field" value={editFormData.register_number} onChange={(e) => setEditFormData({ ...editFormData, register_number: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>College Reg No</label>
                <input type="text" className="input-field" value={editFormData.college_reg_no} onChange={(e) => setEditFormData({ ...editFormData, college_reg_no: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>NSS ID</label>
                <input type="text" className="input-field" value={editFormData.nss_id} onChange={(e) => setEditFormData({ ...editFormData, nss_id: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Department</label>
                <select className="input-field" value={editFormData.department_id} onChange={(e) => setEditFormData({ ...editFormData, department_id: e.target.value })}>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>NSS Unit</label>
                <select className="input-field" value={editFormData.nss_unit_id} onChange={(e) => setEditFormData({ ...editFormData, nss_unit_id: e.target.value })}>
                  <option value="">Select NSS Unit</option>
                  {nssUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.unit_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Academic Course / Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Course / Degree</label>
                <input type="text" className="input-field" value={editFormData.course} onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Year</label>
                <select className="input-field" value={editFormData.year} onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Section</label>
                <input type="text" className="input-field" value={editFormData.section} onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })} />
              </div>
            </div>

            {/* Personal DOB / Gender / Blood */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Date of Birth</label>
                <input type="date" className="input-field" value={editFormData.dob} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Gender</label>
                <select className="input-field" value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Blood Group</label>
                <select className="input-field" value={editFormData.blood_group} onChange={(e) => setEditFormData({ ...editFormData, blood_group: e.target.value })}>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Emergency & Parent */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Parent Name</label>
                <input type="text" className="input-field" value={editFormData.parent_name} onChange={(e) => setEditFormData({ ...editFormData, parent_name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Parent Phone</label>
                <input type="text" className="input-field" value={editFormData.parent_phone} onChange={(e) => setEditFormData({ ...editFormData, parent_phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Emergency Contact</label>
                <input type="text" className="input-field" value={editFormData.emergency_contact} onChange={(e) => setEditFormData({ ...editFormData, emergency_contact: e.target.value })} />
              </div>
            </div>

            {/* Service Metrics & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Volunteer Hours</label>
                <input type="number" className="input-field" min="0" value={editFormData.volunteer_hours} onChange={(e) => setEditFormData({ ...editFormData, volunteer_hours: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Attendance %</label>
                <input type="number" className="input-field" min="0" max="100" value={editFormData.attendance_pct} onChange={(e) => setEditFormData({ ...editFormData, attendance_pct: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Account Status</label>
                <select className="input-field" value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditStudentModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ background: '#1e3a8a' }} disabled={saving}>
                {saving ? 'Saving Master Record...' : 'Save Student Details'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VERIFY REGISTRATION MODAL */}
      {verifyModalStudent && (
        <Modal isOpen={!!verifyModalStudent} onClose={() => setVerifyModalStudent(null)} title={`Verify Registration: ${verifyModalStudent.full_name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>
              Review the applicant details and approve their NSS volunteer membership.
            </p>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><strong>Name:</strong> {verifyModalStudent.full_name}</div>
              <div><strong>Reg No:</strong> {verifyModalStudent.register_number}</div>
              <div><strong>Email:</strong> {verifyModalStudent.student_email}</div>
              <div><strong>Phone:</strong> {verifyModalStudent.student_phone}</div>
              <div><strong>Department:</strong> {verifyModalStudent.department_name}</div>
              <div><strong>Course:</strong> {verifyModalStudent.course}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-danger" onClick={() => handleVerifyStudent(verifyModalStudent.id, 'Rejected')}>
                <XCircle size={16} /> Reject Application
              </button>
              <button className="btn btn-success" onClick={() => handleVerifyStudent(verifyModalStudent.id, 'Approved')}>
                <CheckCircle size={16} /> Approve Volunteer
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
