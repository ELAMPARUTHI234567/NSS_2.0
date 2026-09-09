import React from 'react';
import { Trees, Droplet, HeartHandshake, Award, ShieldAlert, Sparkles, BookOpen, Smile } from 'lucide-react';

export default function ActivitiesPage() {
  const activities = [
    { title: 'Tree Plantation & Cleanliness', icon: Trees, color: '#16a34a', bg: '#dcfce7', desc: 'Plogging drives, planting 1000+ saplings per academic year, campus segregation of non-biodegradable waste, and Swachh Bharat community rallies.' },
    { title: 'Voluntary Blood Donation Camps', icon: Droplet, color: '#dc2626', bg: '#fee2e2', desc: 'Collaborating with Government Blood Bank and Rotary Club to host tri-annual blood donation drives, collecting 200+ units per session.' },
    { title: 'Health Camps & Yoga Awareness', icon: Droplet, color: '#0284c7', bg: '#e0f2fe', desc: 'Free eye-checkup camps, dental screening, mental health awareness, and annual International Yoga Day workshops for students & faculty.' },
    { title: 'Adopted Village Development', icon: HeartHandshake, color: '#d97706', bg: '#fef3c7', desc: 'Sustained community development programs in adopted rural villages focused on literacy, women empowerment, and digital literacy.' },
    { title: 'Disaster Relief & Special Camps', icon: ShieldAlert, color: '#7c3aed', bg: '#f3e8ff', desc: '7-Day Annual Residential Special Camps providing emergency relief, watershed management, road repairs, and flood relief mobilization.' },
    { title: 'National Integration Rallies', icon: Sparkles, color: '#be185d', bg: '#fce7f3', desc: 'Celebrating Independence Day, Republic Day, NSS Day (Sept 24), National Youth Day, and voting awareness voter pledge campaigns.' }
  ];

  return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f2b5c' }}>NSS Community Activities & Initiatives</h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Transforming student enthusiasm into meaningful community impact</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {activities.map((act, i) => {
          const Icon = act.icon;
          return (
            <div key={i} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '0.75rem', background: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icon size={30} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>{act.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>{act.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
