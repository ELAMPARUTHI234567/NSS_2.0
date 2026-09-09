import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Contact NSS Office</h1>
        <p style={{ color: '#64748b' }}>Reach out to National Service Scheme Coordinators & Programme Officers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f2b5c' }}>NSS Central Cell Information</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700 }}>Office Location</h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.2rem' }}>
                  Room 102, Main Administrative Block, XYZ College of Engineering & Technology, Coimbatore - 641001.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Phone size={24} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700 }}>Phone Helpline</h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.2rem' }}>
                  Central Office: +91 98765 43210 <br />
                  Unit I PO: +91 98765 43212
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: '#fef3c7', color: '#b45309', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Mail size={24} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700 }}>Email Address</h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.2rem' }}>
                  nsscell@college.edu | po.unit1@college.edu
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Send an Inquiry</h3>
          {submitted ? (
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
              <h4 style={{ fontWeight: 700 }}>Message Sent Successfully!</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Our NSS Programme Officer will respond to your email shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" className="form-control" placeholder="Enter your full name" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" placeholder="name@domain.com" required />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" className="form-control" placeholder="NSS inquiry subject" required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control" rows="4" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
