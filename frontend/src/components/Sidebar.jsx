import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, Edit3, Calendar, CheckSquare, Award, FileText, Bell,
  Users, UserCheck, Info, Megaphone, Image as ImageIcon, BarChart3, Clock, Settings, LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
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
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-students', label: 'Students / Volunteers', icon: Users },
    { id: 'admin-users', label: 'Users & Roles', icon: UserCheck },
    { id: 'admin-events', label: 'Events', icon: Calendar },
    { id: 'admin-attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'admin-nss-info', label: 'NSS Information', icon: Info },
    { id: 'admin-announcements', label: 'Announcements', icon: Megaphone },
    { id: 'admin-certificates', label: 'Certificates', icon: FileText },
    { id: 'admin-achievements', label: 'Achievements', icon: Award },
    { id: 'admin-banners', label: 'Banner Management', icon: ImageIcon },
    { id: 'admin-gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin-activity-logs', label: 'Activity Logs', icon: Clock },
    { id: 'admin-settings', label: 'Settings', icon: Settings },
  ];

  const items = role === 'Student' ? studentMenuItems : adminMenuItems;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <aside className="sidebar">
      {/* User Information Card */}
      <div className="sidebar-user-card">
        <div className="sidebar-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="sidebar-user-info">
          <div className="user-name">{user.name || user.user_id}</div>
          <div className="user-role">{role}</div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="sidebar-menu">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} className="sidebar-nav-icon" />
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Logout Action at Bottom */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-nav-item logout-btn"
        >
          <LogOut size={19} className="sidebar-nav-icon" />
          <span className="sidebar-nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
