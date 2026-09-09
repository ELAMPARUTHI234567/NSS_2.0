import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ActivitiesPage from './pages/ActivitiesPage';
import PublicEventsPage from './pages/PublicEventsPage';
import PublicAnnouncementsPage from './pages/PublicAnnouncementsPage';
import PublicGalleryPage from './pages/PublicGalleryPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Student Pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentUpdateRequestsPage from './pages/student/StudentUpdateRequestsPage';
import StudentEventsPage from './pages/student/StudentEventsPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentCertificatesPage from './pages/student/StudentCertificatesPage';
import StudentAchievementsPage from './pages/student/StudentAchievementsPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminNssInfoPage from './pages/admin/AdminNssInfoPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import AdminAchievementsPage from './pages/admin/AdminAchievementsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home'); // 'home', 'about', 'dashboard', 'login', etc.
  const [activeTab, setActiveTab] = useState('dashboard'); // sidebar active tab

  // If user clicks "Portal Login" or logs in, switch appropriately
  const renderDashboardContent = () => {
    if (!user) return <LoginPage setActivePage={setActivePage} setActiveTab={setActiveTab} />;

    const isStudent = user.role === 'Student';

    if (isStudent) {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboardPage setActiveTab={setActiveTab} />;
        case 'profile': return <StudentProfilePage />;
        case 'update-requests': return <StudentUpdateRequestsPage />;
        case 'events': return <StudentEventsPage />;
        case 'attendance': return <StudentAttendancePage />;
        case 'certificates': return <StudentCertificatesPage />;
        case 'achievements': return <StudentAchievementsPage />;
        case 'notifications': return <StudentNotificationsPage />;
        default: return <StudentDashboardPage setActiveTab={setActiveTab} />;
      }
    } else {
      switch (activeTab) {
        case 'admin-dashboard': return <AdminDashboardPage />;
        case 'admin-students': return <AdminStudentsPage />;
        case 'admin-users': return <AdminUsersPage />;
        case 'admin-events': return <AdminEventsPage />;
        case 'admin-attendance': return <AdminAttendancePage />;
        case 'admin-nss-info': return <AdminNssInfoPage />;
        case 'admin-announcements': return <AdminAnnouncementsPage />;
        case 'admin-certificates': return <AdminCertificatesPage />;
        case 'admin-achievements': return <AdminAchievementsPage />;
        case 'admin-banners': return <AdminBannersPage />;
        case 'admin-gallery': return <AdminGalleryPage />;
        case 'admin-reports': return <AdminReportsPage />;
        case 'admin-activity-logs': return <AdminActivityLogsPage />;
        case 'admin-settings': return <AdminSettingsPage />;
        default: return <AdminDashboardPage />;
      }
    }
  };

  const isDashboardView = activePage === 'dashboard' && user;

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {isDashboardView ? (
        <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main style={{ flex: 1, padding: '2rem', background: '#f8fafc', overflowY: 'auto' }}>
            {renderDashboardContent()}
          </main>
        </div>
      ) : (
        <main style={{ flex: 1 }}>
          {activePage === 'home' && <HomePage setActivePage={setActivePage} />}
          {activePage === 'about' && <AboutPage />}
          {activePage === 'activities' && <ActivitiesPage />}
          {activePage === 'public-events' && <PublicEventsPage setActivePage={setActivePage} />}
          {activePage === 'public-announcements' && <PublicAnnouncementsPage />}
          {activePage === 'public-gallery' && <PublicGalleryPage />}
          {activePage === 'contact' && <ContactPage />}
          {activePage === 'register' && <RegisterPage setActivePage={setActivePage} />}
          {activePage === 'login' && <LoginPage setActivePage={setActivePage} setActiveTab={setActiveTab} />}
          {activePage === 'dashboard' && renderDashboardContent()}
        </main>
      )}

      {!isDashboardView && <Footer setActivePage={setActivePage} />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
