import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { User, BookOpen, PhoneCall, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterPage({ setActivePage }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [nssUnits, setNssUnits] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: 'K. Elamparuthi',
    registerNumber: '722123104031',
    collegeRegNo: 'REG-2023-IT031',
    dob: '2005-05-12',
    gender: 'Male',
    bloodGroup: 'O+',
    profilePhoto: '',
    address: '123 Gandhi Street',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pinCode: '641001',
    departmentId: '1',
    course: 'B.Tech IT',
    year: 'III Year',
    section: 'A',
    semester: 'V Sem',
    academicYearId: '1',
    nssUnitId: '1',
    joiningYear: '2023',
    studentPhone: '9876500001',
    studentEmail: `student_${Date.now().toString().slice(-4)}@college.edu`,
    parentName: 'M. Karuppasamy',
    parentPhone: '9876500002',
    emergencyContact: '9876500002',
    password: 'password123'
  });

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.success) {
        setDepartments(res.departments || []);
        setNssUnits(res.nssUnits || []);
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && (!formData.fullName || !formData.registerNumber || !formData.dob)) {
      setError('Please fill in required personal details.');
      return;
    }
    if (step === 2 && (!formData.departmentId || !formData.nssUnitId)) {
      setError('Please select your Department and NSS Unit.');
      return;
    }
    if (step === 3 && (!formData.studentEmail || !formData.password || !formData.studentPhone)) {
      setError('Please fill in contact details and password.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register-student', formData);
      if (res.success) {
        setSuccessData(res);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem' }} className="card text-center">
        <div style={{ width: '70px', height: '70px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <CheckCircle size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Student Registration Submitted!</h2>
        <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem 0' }}>
          Your application has been received and assigned temporary ID: <strong style={{ color: '#1d4ed8' }}>{successData.user_id}</strong>
        </p>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <strong>Workflow Status:</strong> <span className="badge badge-warning">Pending Admin Verification</span>
          <p style={{ marginTop: '0.5rem', color: '#475569' }}>
            Once the NSS Programme Officer or Admin approves your registration, your account will be activated and your official NSS ID badge will be granted.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActivePage('login')}>
          Proceed to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>NSS Volunteer Registration</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Join National Service Scheme — "Not Me But You"</p>
        </div>

        {/* Wizard Steps Tracker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 1 ? '#1d4ed8' : '#94a3b8', fontWeight: 700 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 1 ? '#1d4ed8' : '#e2e8f0', color: step >= 1 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            Personal Info
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 2 ? '#1d4ed8' : '#94a3b8', fontWeight: 700 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 2 ? '#1d4ed8' : '#e2e8f0', color: step >= 2 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
            Academic Info
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 3 ? '#1d4ed8' : '#94a3b8', fontWeight: 700 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 3 ? '#1d4ed8' : '#e2e8f0', color: step >= 3 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            Contact & Login
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 4 ? '#1d4ed8' : '#94a3b8', fontWeight: 700 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 4 ? '#1d4ed8' : '#e2e8f0', color: step >= 4 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
            Review & Submit
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={step === 4 ? handleSubmit : handleNext}>
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>1. Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Register Number *</label>
                  <input type="text" name="registerNumber" className="form-control" value={formData.registerNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group *</label>
                  <select name="bloodGroup" className="form-control" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Profile Photo URL (Optional)</label>
                  <input type="text" name="profilePhoto" className="form-control" placeholder="https://..." value={formData.profilePhoto} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea name="address" className="form-control" rows="2" value={formData.address} onChange={handleChange} required></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>District *</label>
                  <input type="text" name="district" className="form-control" value={formData.district} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input type="text" name="pinCode" className="form-control" value={formData.pinCode} onChange={handleChange} required />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>2. Academic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Department *</label>
                  <select name="departmentId" className="form-control" value={formData.departmentId} onChange={handleChange} required>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Course *</label>
                  <input type="text" name="course" className="form-control" value={formData.course} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Year of Study *</label>
                  <select name="year" className="form-control" value={formData.year} onChange={handleChange}>
                    <option value="I Year">I Year</option>
                    <option value="II Year">II Year</option>
                    <option value="III Year">III Year</option>
                    <option value="IV Year">IV Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Section *</label>
                  <input type="text" name="section" className="form-control" value={formData.section} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Semester *</label>
                  <input type="text" name="semester" className="form-control" value={formData.semester} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>College Register Number *</label>
                  <input type="text" name="collegeRegNo" className="form-control" value={formData.collegeRegNo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>NSS Unit *</label>
                  <select name="nssUnitId" className="form-control" value={formData.nssUnitId} onChange={handleChange} required>
                    {nssUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.unit_name} ({u.unit_code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>NSS Joining Year *</label>
                  <input type="text" name="joiningYear" className="form-control" value={formData.joiningYear} onChange={handleChange} required />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>3. Contact & Login Credentials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Student Email *</label>
                  <input type="email" name="studentEmail" className="form-control" value={formData.studentEmail} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Student Phone *</label>
                  <input type="text" name="studentPhone" className="form-control" value={formData.studentPhone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Parent/Guardian Name *</label>
                  <input type="text" name="parentName" className="form-control" value={formData.parentName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Parent Phone *</label>
                  <input type="text" name="parentPhone" className="form-control" value={formData.parentPhone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Emergency Contact *</label>
                  <input type="text" name="emergencyContact" className="form-control" value={formData.emergencyContact} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Create Portal Password *</label>
                  <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>4. Review & Final Verification</h3>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.875rem' }}>
                  <div><strong>Full Name:</strong> {formData.fullName}</div>
                  <div><strong>Register No:</strong> {formData.registerNumber}</div>
                  <div><strong>DOB / Gender:</strong> {formData.dob} ({formData.gender})</div>
                  <div><strong>Blood Group:</strong> {formData.bloodGroup}</div>
                  <div><strong>Course / Year:</strong> {formData.course} - {formData.year}</div>
                  <div><strong>Email:</strong> {formData.studentEmail}</div>
                  <div><strong>Phone:</strong> {formData.studentPhone}</div>
                  <div><strong>City / District:</strong> {formData.city}, {formData.district}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 ? (
              <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button type="submit" className="btn btn-primary">
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Submitting Application...' : 'Confirm & Submit Registration'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
