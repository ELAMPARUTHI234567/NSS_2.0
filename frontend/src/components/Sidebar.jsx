import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, Edit3, Calendar, CheckSquare, Award, FileText, Bell,
  Users, UserCheck, Info, Megaphone, Image as ImageIcon, BarChart3, Clock, Settings, ShieldAlert
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'update-requests', label: 'Update Details', icon: Edit3 },
    { id: 'events', label: 'Events & Registrations', icon: Calendar },
    { id: 'attendance', label: 'Attendance & Hours', icon: CheckSquare },
    { id: 'certificates', label: 'Certificates', icon: FileText },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Students', icon: Users },
    { id: 'admin-users', label: 'Users & Roles', icon: UserCheck },
    { id: 'admin-events', label: 'Event Management', icon: Calendar },
    { id: 'admin-attendance', label: 'Mark Attendance', icon: CheckSquare },
    { id: 'admin-nss-info', label: 'NSS Information', icon: Info },
    { id: 'admin-announcements', label: 'Announcements', icon: Megaphone },
    { id: 'admin-certificates', label: 'Certificates', icon: FileText },
    { id: 'admin-achievements', label: 'Achievements', icon: Award },
    { id: 'admin-banners', label: 'Banner Management', icon: ImageIcon },
    { id: 'admin-gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'admin-reports', label: 'Reports & Export', icon: BarChart3 },
    { id: 'admin-activity-logs', label: 'Activity Logs', icon: Clock },
    { id: 'admin-settings', label: 'System Settings', icon: Settings },
  ];

  const items = role === 'Student' ? studentMenuItems : adminMenuItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h4 style={{ color: 'white', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
            {user.name}
          </h4>
          <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
            {user.nss_id || user.user_id}
          </span>
        </div>
      </div>

      <div className="sidebar-menu">
        <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
          {role} Navigation
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
