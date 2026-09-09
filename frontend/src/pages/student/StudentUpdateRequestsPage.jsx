import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function StudentUpdateRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/students/profile/update-requests');
      if (res.success) setRequests(res.requests || []);
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profile Update Requests</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Track the status of submitted profile field update applications</p>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Req ID</th>
              <th>Field Name</th>
              <th>Old Value</th>
              <th>New Value Requested</th>
              <th>Reason</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Admin Remarks</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  No profile update requests submitted yet.
                </td>
              </tr>
            ) : (
              requests.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>#{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.field_name}</td>
                  <td style={{ color: '#64748b' }}>{r.old_value || 'N/A'}</td>
                  <td style={{ fontWeight: 700, color: '#1d4ed8' }}>{r.new_value}</td>
                  <td style={{ fontSize: '0.85rem' }}>{r.reason}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>● {r.status}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>{r.remarks || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
