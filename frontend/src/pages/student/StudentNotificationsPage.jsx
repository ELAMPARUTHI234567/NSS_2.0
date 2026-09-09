import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function StudentNotificationsPage() {
  const { notifications } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notification Center</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>System announcements, status alerts, and activity notifications</p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(n => (
            <div key={n.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: n.is_read ? '#f8fafc' : '#e0f2fe', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <Bell size={20} className="text-blue-600" />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{n.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>{n.message}</p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
