import React, { useState } from 'react';
import { Bell, Check, Info, AlertTriangle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications } = useAuth();
  const [open, setOpen] = useState(false);

  const handleMarkRead = async (id = null) => {
    try {
      await api.post('/notifications/mark-read', { id });
      fetchNotifications();
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-emerald-600" />;
      case 'certificate': return <Award className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      <button
        onClick={() => setOpen(!open)}
        title="Notifications"
        style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}
      >
        <Bell size={18} />
        <span
          style={{
            position: 'absolute',
            top: '3px',
            right: '3px',
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%',
            border: '1.5px solid #063a70',
            boxShadow: '0 0 6px rgba(239, 68, 68, 0.9)'
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '2.5rem',
            width: '320px',
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            zIndex: 100,
            color: '#0f172a',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={() => handleMarkRead()} style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                    background: n.is_read ? 'white' : '#f0f9ff',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ marginTop: '0.15rem' }}>{getIcon(n.type)}</div>
                  <div>
                    <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1e293b' }}>{n.title}</h5>
                    <p style={{ fontSize: '0.775rem', color: '#475569', marginTop: '0.15rem' }}>{n.message}</p>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
