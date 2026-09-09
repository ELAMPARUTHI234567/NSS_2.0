import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Info, Target, Compass, Award, CheckSquare, PhoneCall } from 'lucide-react';

export default function AboutPage() {
  const [nssInfo, setNssInfo] = useState({});

  useEffect(() => {
    api.get('/nss-info').then(res => {
      if (res.success) setNssInfo(res.info);
    }).catch(() => {});
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f2b5c' }}>About National Service Scheme (NSS)</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
          Motto: <strong style={{ color: '#d97706' }}>"Not Me But You"</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#1d4ed8' }}>
            <Info size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>About NSS</h2>
          </div>
          <p style={{ fontSize: '0.925rem', lineHeight: 1.7, color: '#334155' }}>
            {nssInfo.about?.content || 'The National Service Scheme (NSS) is an Indian government sector public service program conducted by the Ministry of Youth Affairs and Sports. Launched in Gandhi centenary year 1969, NSS is aimed at developing student personality through community service.'}
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#059669' }}>
            <Target size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Vision & Mission</h2>
          </div>
          <p style={{ fontSize: '0.925rem', lineHeight: 1.7, color: '#334155', marginBottom: '1rem' }}>
            <strong>Vision:</strong> {nssInfo.vision?.content || 'To build patriotic, disciplined, socially responsible and selfless youth dedicated to the service of the nation.'}
          </p>
          <p style={{ fontSize: '0.925rem', lineHeight: 1.7, color: '#334155' }}>
            <strong>Mission:</strong> {nssInfo.mission?.content || 'To enable student volunteers to understand community needs, develop civic consciousness, foster teamwork, and render active voluntary social services.'}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#d97706' }}>
          <CheckSquare size={24} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Volunteer Guidelines & Rules</h2>
        </div>
        <p style={{ whiteSpace: 'pre-line', fontSize: '0.925rem', lineHeight: 1.7, color: '#334155' }}>
          {nssInfo.rules?.content || '1. Every volunteer must complete 120 hours of regular service per year.\n2. Active participation in Special Camping program (7 days) is mandatory.\n3. Maintain discipline, punctuality, and wear NSS badge during events.\n4. Maintain 80%+ event attendance for NSS Certification.'}
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>NSS Programme Officers</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            RA
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Dr. R. Arunkumar</h3>
          <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>Programme Officer — Unit I</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Associate Professor, Department of IT</p>
          <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>📞 +91 98765 43212 | ✉️ po1@college.edu</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            MS
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Prof. M. Selvam</h3>
          <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>Programme Officer — Unit II</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Assistant Professor, Dept of Mechanical</p>
          <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>📞 +91 98765 43213 | ✉️ po2@college.edu</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            SK
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Dr. S. Kavittha</h3>
          <p style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>Programme Officer — Unit III</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Associate Professor, Department of CSE</p>
          <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>📞 +91 98765 43214 | ✉️ po3@college.edu</p>
        </div>
      </div>
    </div>
  );
}
