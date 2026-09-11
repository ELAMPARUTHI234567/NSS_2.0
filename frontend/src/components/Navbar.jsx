import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, Menu, X } from 'lucide-react';

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
    <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#1e3a8a', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1.25rem' }}>
        
        {/* Brand Header */}
        <div className="nav-brand" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <svg className="nss-logo-img" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '44px', height: '44px' }}>
            <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#f59e0b" strokeWidth="4"/>
            <circle cx="50" cy="50" r="38" fill="#c026d3" opacity="0.15"/>
            <path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M25 75 L75 25" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="16" fill="#1e3a8a" stroke="#ffffff" strokeWidth="4"/>
            <circle cx="50" cy="50" r="6" fill="#ef4444"/>
          </svg>
          <div className="brand-text">
            <h1 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              NATIONAL SERVICE SCHEME
            </h1>
            <p style={{ color: '#fbbf24', fontSize: '0.72rem', margin: 0, fontWeight: 700, whiteSpace: 'nowrap' }}>
              NOT ME BUT YOU — College Portal
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'nowrap' }}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                style={{
                  color: '#e2e8f0',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '0.5rem',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent'
                }}
              >
                {item.label}
              </button>
            );
          })}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem', flexShrink: 0 }}>
              <NotificationBell />
              <button
                onClick={() => handleNavClick('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}
              >
                <User size={15} />
                <span>{user.name}</span>
                <span className={`badge badge-${user.role === 'Student' ? 'info' : 'warning'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  {user.role}
                </span>
              </button>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.15)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.5rem', flexShrink: 0 }}>
              <button className="nav-link" onClick={() => handleNavClick('register')} style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
                Register
              </button>
              <button className="btn-login" onClick={() => handleNavClick('login')} style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800, fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                Login
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: 'white', display: 'none', cursor: 'pointer' }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#0f2b5c', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <button
              key={`mobile-${item.id}`}
              className={`nav-link ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}
            >
              {item.label}
            </button>
          ))}
          {user ? (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <button className="btn btn-primary" onClick={() => handleNavClick('dashboard')} style={{ flex: 1 }}>Dashboard</button>
              <button className="btn btn-outline" onClick={logout} style={{ color: '#f87171', borderColor: '#f87171' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <button className="btn btn-outline" onClick={() => handleNavClick('register')} style={{ flex: 1, color: 'white', borderColor: 'white' }}>Register</button>
              <button className="btn btn-primary" onClick={() => handleNavClick('login')} style={{ flex: 1, background: '#f59e0b', color: '#0f172a' }}>Login</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
