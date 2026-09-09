import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Clock, Shield } from 'lucide-react';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/activity-logs');
      if (res.success) setLogs(res.logs || []);
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>System Audit & Activity Logs</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time immutable security logs of administrative and user actions</p>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>User ID</th>
              <th>User Name</th>
              <th>Role</th>
              <th>Action Description</th>
              <th>Module</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>#{l.id}</td>
                <td style={{ fontWeight: 800, color: '#1d4ed8' }}>{l.user_id}</td>
                <td style={{ fontWeight: 600 }}>{l.user_name}</td>
                <td>
                  <span className={`badge badge-${l.role === 'Super Admin' ? 'danger' : l.role === 'Admin' ? 'warning' : 'info'}`}>
                    {l.role}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{l.action}</td>
                <td><span className="badge badge-info">{l.module}</span></td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{l.ip_address}</td>
                <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
