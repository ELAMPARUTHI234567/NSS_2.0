import React from 'react';
import { Heart, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 2rem 1.5rem 2rem', marginTop: 'auto', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>NATIONAL SERVICE SCHEME</h3>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            NSS Portal — Promoting student youth development through community service, social responsibility, and national integration.
          </p>
          <div style={{ display: 'inline-block', padding: '0.35rem 0.85rem', background: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem' }}>
            Motto: "Not Me But You"
          </div>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <li><button onClick={() => setActivePage('home')} style={{ color: '#cbd5e1' }}>Home</button></li>
            <li><button onClick={() => setActivePage('about')} style={{ color: '#cbd5e1' }}>About NSS</button></li>
            <li><button onClick={() => setActivePage('activities')} style={{ color: '#cbd5e1' }}>NSS Activities</button></li>
            <li><button onClick={() => setActivePage('public-events')} style={{ color: '#cbd5e1' }}>Upcoming Events</button></li>
            <li><button onClick={() => setActivePage('public-gallery')} style={{ color: '#cbd5e1' }}>Photo Gallery</button></li>
            <li><button onClick={() => setActivePage('register')} style={{ color: '#cbd5e1' }}>Volunteer Registration</button></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>NSS Units & Info</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Unit I — Dr. R. Arunkumar (PO)</p>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Unit II — Prof. M. Selvam (PO)</p>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Unit III — Dr. S. Kavittha (PO)</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', color: '#38bdf8' }}>XYZ College of Engineering & Tech</p>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Contact Office</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: '#38bdf8' }} />
              <span>NSS Cell, Room 102, Main Admin Block</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} style={{ color: '#38bdf8' }} />
              <span>+91 98765 43210</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} style={{ color: '#38bdf8' }} />
              <span>nsscell@college.edu</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '2rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        © {new Date().getFullYear()} National Service Scheme (NSS) College Management System. All rights reserved.
      </div>
    </footer>
  );
}
