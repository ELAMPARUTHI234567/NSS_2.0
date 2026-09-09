import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Megaphone, Calendar, Tag, AlertCircle } from 'lucide-react';

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    api.get('/announcements').then(res => {
      if (res.success) setAnnouncements(res.announcements || []);
    }).catch(() => {});
  }, []);

  const filtered = priorityFilter === 'All'
    ? announcements
    : announcements.filter(a => a.priority === priorityFilter);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>NSS Announcements & Circulars</h1>
        <p style={{ color: '#64748b' }}>Latest updates, urgent notices, and orientation circulars</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['All', 'Urgent', 'Important', 'General'].map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`btn ${priorityFilter === p ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem' }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.map(anc => (
          <div key={anc.id} className="card" style={{ padding: '1.5rem', borderLeft: `6px solid ${anc.priority === 'Urgent' ? '#ef4444' : anc.priority === 'Important' ? '#f59e0b' : '#3b82f6'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge badge-${anc.priority}`}>🔴 {anc.priority}</span>
                <span className="badge badge-info">{anc.category}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Published: {new Date(anc.publish_date).toLocaleString()}</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0.35rem 0' }}>{anc.title}</h3>
            <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>{anc.description}</p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>
              Published By: {anc.published_by}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
