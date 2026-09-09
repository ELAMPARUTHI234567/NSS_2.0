import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import ExportButtons from '../../components/ExportButtons';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { Users, UserCheck, Clock, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/reports/dashboard-stats');
      if (res.success) {
        setStats(res.stats || {});
        setCharts(res.charts || {});
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  // Chart 1: Department Bar Chart
  const deptData = {
    labels: (charts.studentsByDepartment || []).map(d => d.department),
    datasets: [
      {
        label: 'Registered Volunteers',
        data: (charts.studentsByDepartment || []).map(d => d.count),
        backgroundColor: ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626']
      }
    ]
  };

  // Chart 2: Year Pie Chart
  const yearData = {
    labels: (charts.studentsByYear || []).map(y => y.year),
    datasets: [
      {
        data: (charts.studentsByYear || []).map(y => y.count),
        backgroundColor: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24']
      }
    ]
  };

  // Chart 3: NSS Unit Doughnut
  const unitData = {
    labels: (charts.nssUnitDistribution || []).map(u => u.unit),
    datasets: [
      {
        data: (charts.nssUnitDistribution || []).map(u => u.count),
        backgroundColor: ['#1d4ed8', '#059669', '#d97706']
      }
    ]
  };

  // Chart 4: Monthly Hours Line Chart
  const monthlyData = {
    labels: (charts.monthlyVolunteerHours || []).map(m => m.month),
    datasets: [
      {
        label: 'Volunteer Hours Accredited',
        data: (charts.monthlyVolunteerHours || []).map(m => m.hours),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.15)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>NSS Management Master Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time student participation, event metrics, and volunteer hours analytics</p>
        </div>

        <ExportButtons data={[stats]} filename="NSS_Dashboard_KPI_Summary" title="NSS Dashboard KPI Summary" />
      </div>

      {/* Top Counters Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Students</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.totalStudents || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Active Volunteers</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#059669' }}>{stats.activeVolunteers || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <UserCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Pending Verifications</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#d97706' }}>{stats.pendingRegistrations || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Pending Profile Updates</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#7c3aed' }}>{stats.pendingUpdates || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Events</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{stats.totalEvents || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Volunteer Hours</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#059669' }}>{stats.totalHours || 0} hrs</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Avg Attendance %</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#2563eb' }}>{stats.avgAttendance || '0.0'}%</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Certificates Issued</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#d97706' }}>{stats.certificatesIssued || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Volunteers by Department</h3>
          <Bar data={deptData} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Volunteers by Year of Study</h3>
          <div style={{ maxHeight: '260px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={yearData} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>NSS Unit Distribution</h3>
          <div style={{ maxHeight: '260px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={unitData} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Monthly Volunteer Hours Trend</h3>
          <Line data={monthlyData} />
        </div>
      </div>
    </div>
  );
}
