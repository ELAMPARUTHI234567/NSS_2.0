import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import ExportButtons from '../../components/ExportButtons';
import { BarChart3, Download, Filter } from 'lucide-react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('students');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/export-data?reportType=${reportType}`);
      if (res.success) setReportData(res.data || []);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>NSS Master Reports & Export Engine</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Generate structured reports for audit, university submissions, and volunteer records</p>
        </div>

        <ExportButtons data={reportData} filename={`NSS_Report_${reportType}`} title={`NSS Report - ${reportType.toUpperCase()}`} />
      </div>

      {/* Report Selector Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'students', label: 'Student Volunteers Directory' },
          { id: 'events', label: 'Events Summary Report' },
          { id: 'attendance', label: 'Attendance Audit Register' },
          { id: 'hours', label: 'Volunteer Hours Credit Log' },
          { id: 'certificates', label: 'Certificates Issued Register' }
        ].map(r => (
          <button
            key={r.id}
            className={`btn ${reportType === r.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setReportType(r.id)}
            style={{ fontSize: '0.85rem' }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Report Data Preview Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            {reportData.length > 0 && (
              <tr>
                {Object.keys(reportData[0]).map(key => (
                  <th key={key} style={{ textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading report data...
                </td>
              </tr>
            ) : reportData.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  No data records found for this report type.
                </td>
              </tr>
            ) : (
              reportData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} style={{ fontSize: '0.85rem' }}>
                      {val !== null && val !== undefined ? String(val) : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
