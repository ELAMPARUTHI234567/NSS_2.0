import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import Modal from '../../components/Modal';
import { User, ShieldCheck, Mail, Phone, MapPin, Calendar, BookOpen, AlertCircle, CheckCircle2, Award, Info, FileText } from 'lucide-react';

export default function StudentProfilePage() {
  const { user, showToast } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'academic', 'contact', 'emergency', 'nss'
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Correction Request State
  const [requestForm, setRequestForm] = useState({
    field_name: 'Full Name',
    old_value: '',
    new_value: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user.profile) {
        setProfile(res.user.profile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const calculateCompletion = (p) => {
    if (!p) return { pct: 0, missing: [] };
    const fields = [
      { name: 'Full Name', val: p.full_name },
      { name: 'Profile Photo', val: p.profile_photo },
      { name: 'Register Number', val: p.register_number },
      { name: 'Date of Birth', val: p.dob },
      { name: 'Gender', val: p.gender },
      { name: 'Blood Group', val: p.blood_group },
      { name: 'Department', val: p.department_name || p.department_id },
      { name: 'Course', val: p.course },
      { name: 'Year', val: p.year },
      { name: 'Section', val: p.section },
      { name: 'NSS Unit', val: p.unit_name || p.nss_unit_id },
      { name: 'Phone Number', val: p.student_phone },
      { name: 'Email Address', val: p.student_email },
      { name: 'Address', val: p.address },
      { name: 'City', val: p.city },
      { name: 'State', val: p.state },
      { name: 'PIN Code', val: p.pin_code },
      { name: 'Parent Name', val: p.parent_name },
      { name: 'Parent Phone', val: p.parent_phone },
      { name: 'Emergency Contact', val: p.emergency_contact }
    ];

    const filled = fields.filter(f => f.val && String(f.val).trim() !== '');
    const missing = fields.filter(f => !f.val || String(f.val).trim() === '').map(f => f.name);
    const pct = Math.round((filled.length / fields.length) * 100);
    return { pct, missing };
  };

  const handleOpenRequestModal = (fieldName = 'Full Name', currentVal = '') => {
    setRequestForm({
      field_name: fieldName,
      old_value: currentVal,
      new_value: '',
      reason: ''
    });
    setRequestModalOpen(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.new_value || !requestForm.reason) {
      showToast('Please enter requested value and reason.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/students/profile/update-request', requestForm);
      if (res.success) {
        showToast(res.message, 'success');
        setRequestModalOpen(false);
        setRequestForm({ field_name: 'Full Name', old_value: '', new_value: '', reason: '' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit correction request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading student profile...</div>;

  const completion = calculateCompletion(profile);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Profile Header Summary Card */}
      <div className="card" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', borderRadius: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={profile.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop'}
            alt={profile.full_name}
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #1e3a8a', boxShadow: '0 4px 12px rgba(30,58,138,0.2)' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop'; }}
          />
          <span className={`badge badge-${profile.status === 'Approved' ? 'success' : 'warning'}`} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
            {profile.status}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{profile.full_name}</h1>
              <p style={{ color: '#1e3a8a', fontWeight: 800, fontSize: '1rem', marginTop: '0.25rem' }}>
                NSS ID: {profile.nss_id || user.user_id} | Reg No: {profile.register_number}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {profile.course} ({profile.year}, Section {profile.section}) — {profile.department_name || 'Department of IT'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenRequestModal('General Information', '')}
                style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}
              >
                <AlertCircle size={16} /> Request Profile Correction
              </button>
            </div>
          </div>

          {/* Profile Completion Indicator */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>Profile Completion</span>
              <span style={{ fontWeight: 800, color: completion.pct >= 80 ? '#16a34a' : '#d97706' }}>{completion.pct}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${completion.pct}%`, height: '100%', background: completion.pct >= 80 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #d97706, #f59e0b)', borderRadius: '9999px', transition: 'width 0.5s ease-in-out' }} />
            </div>
            {completion.missing.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                Missing optional details: {completion.missing.slice(0, 3).join(', ')}{completion.missing.length > 3 ? ` +${completion.missing.length - 3} more` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveTab('personal')}
          className={`btn ${activeTab === 'personal' ? 'btn-primary' : 'btn-outline'}`}
          style={{ background: activeTab === 'personal' ? '#1e3a8a' : 'transparent', color: activeTab === 'personal' ? 'white' : '#475569', border: 'none', borderRadius: '0.5rem 0.5rem 0 0', fontWeight: 700 }}
        >
          1. Personal Information
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`btn ${activeTab === 'academic' ? 'btn-primary' : 'btn-outline'}`}
          style={{ background: activeTab === 'academic' ? '#1e3a8a' : 'transparent', color: activeTab === 'academic' ? 'white' : '#475569', border: 'none', borderRadius: '0.5rem 0.5rem 0 0', fontWeight: 700 }}
        >
          2. Academic Information
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`btn ${activeTab === 'contact' ? 'btn-primary' : 'btn-outline'}`}
          style={{ background: activeTab === 'contact' ? '#1e3a8a' : 'transparent', color: activeTab === 'contact' ? 'white' : '#475569', border: 'none', borderRadius: '0.5rem 0.5rem 0 0', fontWeight: 700 }}
        >
          3. Contact Information
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`btn ${activeTab === 'emergency' ? 'btn-primary' : 'btn-outline'}`}
          style={{ background: activeTab === 'emergency' ? '#1e3a8a' : 'transparent', color: activeTab === 'emergency' ? 'white' : '#475569', border: 'none', borderRadius: '0.5rem 0.5rem 0 0', fontWeight: 700 }}
        >
          4. Emergency Information
        </button>
        <button
          onClick={() => setActiveTab('nss')}
          className={`btn ${activeTab === 'nss' ? 'btn-primary' : 'btn-outline'}`}
          style={{ background: activeTab === 'nss' ? '#1e3a8a' : 'transparent', color: activeTab === 'nss' ? 'white' : '#475569', border: 'none', borderRadius: '0.5rem 0.5rem 0 0', fontWeight: 700 }}
        >
          5. NSS Information
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="card" style={{ padding: '2rem', borderRadius: '1rem' }}>
        
        {/* Tab 1: Personal Information */}
        {activeTab === 'personal' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Personal Details</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Master Record (Admin Managed)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Full Name</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.full_name}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date of Birth</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.dob || 'N/A'}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Gender</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.gender || 'N/A'}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Blood Group</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>{profile.blood_group || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Academic Information */}
        {activeTab === 'academic' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Academic Record</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Master Record (Admin Managed)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Register Number</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.register_number}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>College Registration No</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.college_reg_no || 'N/A'}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.department_name || 'Information Technology'}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Degree & Course</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.course}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Year & Section</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.year} (Section {profile.section})</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Semester</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.semester}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Contact Information */}
        {activeTab === 'contact' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Contact Information</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Submitted Contact Records</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student Email</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.student_email}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student Phone</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.student_phone}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Permanent Residential Address</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                  {profile.address}, {profile.city}, {profile.district}, {profile.state} - {profile.pin_code}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Emergency Information */}
        {activeTab === 'emergency' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Emergency & Guardian Details</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Emergency Contacts</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parent / Guardian Name</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.parent_name || 'N/A'}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parent Phone</span>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{profile.parent_phone || 'N/A'}</p>
              </div>
              <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>Emergency Contact Number</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>{profile.emergency_contact || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: NSS Information */}
        {activeTab === 'nss' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Official NSS Service Record</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Unit Activity Metrics</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>Assigned NSS Unit</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b5c', marginTop: '0.2rem' }}>{profile.unit_name || 'NSS Unit I'}</p>
              </div>
              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Joining Year</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350f', marginTop: '0.2rem' }}>{profile.joining_year}</p>
              </div>
              <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Logged Volunteer Hours</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532d', marginTop: '0.2rem' }}>{profile.volunteer_hours} Hours</p>
              </div>
              <div style={{ background: '#f3e8ff', padding: '1rem', borderRadius: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>Event Attendance Rate</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#581c87', marginTop: '0.2rem' }}>{profile.attendance_pct}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CORRECTION REQUEST MODAL */}
      {requestModalOpen && (
        <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Submit Profile Correction Request">
          <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
              <strong>Notice:</strong> To maintain database integrity, master student information can only be edited directly by Admin. Submit your requested correction below for review.
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Field Requiring Correction *
              </label>
              <select
                className="input-field"
                value={requestForm.field_name}
                onChange={(e) => setRequestForm({ ...requestForm, field_name: e.target.value })}
              >
                <option value="Full Name">Full Name</option>
                <option value="Register Number">Register Number</option>
                <option value="College Reg No">College Registration Number</option>
                <option value="Department">Department</option>
                <option value="Course">Course</option>
                <option value="Year">Year</option>
                <option value="Section">Section</option>
                <option value="Date of Birth">Date of Birth</option>
                <option value="Gender">Gender</option>
                <option value="Blood Group">Blood Group</option>
                <option value="NSS Unit">NSS Unit</option>
                <option value="Phone Number">Phone Number</option>
                <option value="Email Address">Email Address</option>
                <option value="Address">Address</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Current Database Value
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Current value in system"
                value={requestForm.old_value}
                onChange={(e) => setRequestForm({ ...requestForm, old_value: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Requested Correct Value *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter the correct new value"
                value={requestForm.new_value}
                onChange={(e) => setRequestForm({ ...requestForm, new_value: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Reason for Correction *
              </label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Provide explanation for Admin verification..."
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: '#1e3a8a' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request to Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
