import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Calendar, Clock, Award, FileText, CheckCircle2, Megaphone, UserCheck, Shield } from 'lucide-react';

export default function StudentDashboardPage({ setActiveTab }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const meRes = await api.get('/auth/me');
      if (meRes.success && meRes.user.profile) {
        setProfile(meRes.user.profile);
      }

      const evRes = await api.get('/events?status=Registration%20Open');
      if (evRes.success) setUpcomingEvents(evRes.events || []);

      const ancRes = await api.get('/announcements');
      if (ancRes.success) setAnnouncements(ancRes.announcements.slice(0, 3));

      const regRes = await api.get('/events/my/registrations');
      if (regRes.success) setRegistrations(regRes.registrations || []);

    } catch (err) {}
  };

  const isApproved = profile?.status === 'Approved';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className={`badge badge-${isApproved ? 'success' : 'warning'}`} style={{ fontSize: '0.8rem' }}>
              ● {profile?.status || 'Pending Approval'}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>NSS ID: {profile?.nss_id || user.user_id}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {user.name}! 👋</h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            NSS Volunteer — {profile?.department_name || 'Department'} ({profile?.unit_name || 'NSS Unit'})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setActiveTab('profile')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            View Profile
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('events')} style={{ background: '#f59e0b', color: '#0f172a' }}>
            Explore Events
          </button>
        </div>
      </div>

      {!isApproved && (
        <div style={{ background: '#fef3c7', color: '#b45309', padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={24} />
          <div>
            <strong>Account Pending Admin Verification:</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>
              Your registration application is currently under review by the NSS Programme Officer. Event registrations will unlock immediately after approval.
            </p>
          </div>
        </div>
      )}

      {/* KPI Counters Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Total Events</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{profile?.total_events || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Volunteer Hours</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#059669' }}>{profile?.volunteer_hours || 0} hrs</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Attendance %</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#0284c7' }}>{profile?.attendance_pct || '0.00'}%</h3>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Certificates Issued</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#d97706' }}>2</h3>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <FileText size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Registered & Upcoming Events */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Available Events for Registration</h3>
            <button onClick={() => setActiveTab('events')} style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingEvents.slice(0, 3).map(ev => (
              <div key={ev.id} style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                <img src={ev.event_poster} alt={ev.event_name} style={{ width: '60px', height: '60px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{ev.event_name}</h4>
                  <p style={{ fontSize: '0.775rem', color: '#64748b' }}>📅 {ev.event_date} | 📍 {ev.venue}</p>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>{ev.category}</span>
                </div>
                <button className="btn btn-primary" onClick={() => setActiveTab('events')} style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                  Register
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Latest Announcements</h3>
            <Megaphone size={20} className="text-amber-500" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map(anc => (
              <div key={anc.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${anc.priority}`} style={{ fontSize: '0.65rem' }}>{anc.priority}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(anc.publish_date).toLocaleDateString()}</span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.35rem' }}>{anc.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>{anc.description.substring(0, 90)}...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
