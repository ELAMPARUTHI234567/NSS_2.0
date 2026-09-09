import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Award, Star, Medal } from 'lucide-react';

export default function StudentAchievementsPage() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await api.get('/achievements');
      if (res.success) setAchievements(res.achievements || []);
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Achievements & Awards</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Recognitions, Best Volunteer awards, and honors earned</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {achievements.map(ach => (
          <div key={ach.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Medal size={30} />
            </div>
            <div>
              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{ach.award_type}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{ach.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>{ach.description}</p>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                Given By: {ach.given_by} on {ach.award_date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
