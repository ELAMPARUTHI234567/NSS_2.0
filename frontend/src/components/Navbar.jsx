import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, Menu, X } from 'lucide-react';
import nssLogo from '../assets/nss-logo.png';
import bitLogo from '../assets/bit-logo.png';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'organisation', label: 'ORGANISATION' },
    { id: 'activities', label: 'ACTIVITIES' },
    { id: 'public-events', label: 'EVENTS' },
    { id: 'public-announcements', label: 'ANNOUNCEMENTS' },
    { id: 'public-gallery', label: 'GALLERY' },
    { id: 'volunteers', label: 'VOLUNTEERS' },
    { id: 'about', label: 'ABOUT' },
    { id: 'contact', label: 'CONTACT' }
  ];

  return (
    <header className="nss-header-navbar">
      <div className="nss-nav-container">

        {/* Far-Right Background Graphic & Slogan (Subtle overlay) */}
        <div
          className="navbar-far-right-graphic"
          style={{
            position: 'absolute',
            right: '1.25rem',
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            pointerEvents: 'none',
            opacity: 0.35,
            zIndex: 1
          }}
        >
          {/* Subtle Youth Silhouettes SVG */}
          <svg width="110" height="38" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="14" r="5" fill="#ffffff" />
            <path d="M12 40v-14c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="6" y1="26" x2="34" y2="26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

            <circle cx="55" cy="14" r="5" fill="#ffffff" />
            <path d="M47 40v-14c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="41" y1="26" x2="69" y2="26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

            <circle cx="90" cy="14" r="5" fill="#ffffff" />
            <path d="M82 40v-14c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="76" y1="26" x2="104" y2="26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

            <circle cx="125" cy="14" r="5" fill="#ffffff" />
            <path d="M117 40v-14c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6v14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="111" y1="26" x2="139" y2="26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          {/* Slogan Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.05, textAlign: 'right' }}>
            <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', color: '#ffffff', fontSize: '0.82rem', fontWeight: 600 }}>
              Youth
            </span>
            <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', color: '#93c5fd', fontSize: '0.66rem' }}>
              for a Better
            </span>
            <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', color: '#facc15', fontSize: '0.85rem', fontWeight: 800, borderBottom: '2px solid #facc15', paddingBottom: '1px' }}>
              Tomorrow
            </span>
          </div>
        </div>

        {/* 1. LEFT SECTION: Dual Branding (Uploaded NSS Logo + Text + Divider + Uploaded BIT Logo) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, zIndex: 2 }}>
          
          {/* NSS Branding */}
          <div
            className="nav-brand"
            onClick={() => handleNavClick('home')}
            title="National Service Scheme - Unit 1"
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          >
            {/* Uploaded NSS Emblem Image */}
            <img
              src={nssLogo}
              alt="National Service Scheme Logo"
              className="nss-logo-img"
              style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }}
            />

            {/* NSS Text Header (Prevents vertical squeezing) */}
            <div className="brand-text" style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <h1 style={{ color: '#ffffff', fontSize: '1.02rem', fontWeight: 900, letterSpacing: '0.5px', margin: 0, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                NATIONAL SERVICE SCHEME
              </h1>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', fontWeight: 800, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                <span style={{ color: '#facc15' }}>NOT ME BUT YOU</span>
                <span style={{ color: '#93c5fd', fontStyle: 'italic', fontWeight: 600 }}> — Unit 1</span>
              </p>
            </div>
          </div>

          {/* Vertical Separator Line */}
          <div style={{ width: '1px', height: '42px', background: 'rgba(255, 255, 255, 0.28)', margin: '0 0.25rem', flexShrink: 0 }} />

          {/* Bannari Amman Institute of Technology Branding */}
          <div
            onClick={() => handleNavClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexShrink: 0 }}
            title="Bannari Amman Institute of Technology"
          >
            {/* Uploaded BIT Logo Image */}
            <img
              src={bitLogo}
              alt="Bannari Amman Institute of Technology Logo"
              className="bit-logo-img"
              style={{
                height: '42px',
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
          </div>

        </div>

        {/* 2. CENTER SECTION: Navigation Links */}
        <nav className="desktop-nav-menu">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* 3. RIGHT SECTION: Notification Bell, Admin Profile Card & Logout */}
        <div className="nav-right-controls">
          
          {/* Notification Bell */}
          <NotificationBell />

          {/* Vertical Divider Line */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.25)', margin: '0 0.1rem' }} />

          {/* Admin Profile Card */}
          <div
            className="admin-profile-card"
            onClick={() => handleNavClick(user ? 'dashboard' : 'login')}
            title={user ? `${user.name} - Dashboard` : "Admin Portal Login"}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <User size={16} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15 }}>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                {user ? user.name : 'Prof. V.'}
              </span>
              <span style={{ color: '#bfdbfe', fontSize: '0.66rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {user ? (user.role === 'Student' ? 'NSS Volunteer' : 'Admin Officer') : 'Admin Officer'}
              </span>
            </div>

            <span style={{
              background: '#facc15',
              color: '#0f172a',
              fontSize: '0.63rem',
              fontWeight: 900,
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              marginLeft: '0.2rem',
              letterSpacing: '0.2px',
              textTransform: 'uppercase',
              boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              flexShrink: 0
            }}>
              {user ? (user.role === 'Student' ? 'Volunteer' : 'Admin') : 'Admin'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            className="logout-icon-btn"
            onClick={() => {
              if (user) {
                logout();
              } else {
                handleNavClick('login');
              }
            }}
            title={user ? "Logout" : "Login"}
          >
            <LogOut size={17} />
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: '#04152e',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
        }}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={`mobile-${item.id}`}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.65rem 0.9rem', fontSize: '0.85rem' }}
              >
                {item.label}
              </button>
            );
          })}

          <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: '0.75rem' }}>
            {user ? (
              <>
                <button className="btn btn-primary" onClick={() => handleNavClick('dashboard')} style={{ flex: 1, fontSize: '0.85rem' }}>
                  Dashboard ({user.name})
                </button>
                <button className="btn btn-outline" onClick={logout} style={{ color: '#f87171', borderColor: '#f87171', fontSize: '0.85rem' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => handleNavClick('register')} style={{ flex: 1, color: 'white', borderColor: 'white', fontSize: '0.85rem' }}>
                  Register
                </button>
                <button className="btn btn-primary" onClick={() => handleNavClick('login')} style={{ flex: 1, background: '#f59e0b', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}



