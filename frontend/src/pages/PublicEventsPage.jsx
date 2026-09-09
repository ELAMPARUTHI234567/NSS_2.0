import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import { Calendar, MapPin, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PublicEventsPage({ setActivePage }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.success) setEvents(res.events || []);
    } catch (err) {}
  };

  const categories = ['All', 'Environmental Care', 'Health & Wellness', 'Swachh Bharat', 'Awareness Rally'];

  const filteredEvents = categoryFilter === 'All'
    ? events
    : events.filter(e => e.category === categoryFilter);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>NSS Events Portal</h1>
        <p style={{ color: '#64748b' }}>Explore upcoming voluntary community service events and campaigns</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn ${categoryFilter === cat ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {filteredEvents.map(ev => {
          const pct = Math.min(100, Math.round((ev.registered_count / ev.max_participants) * 100));
          return (
            <div key={ev.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={ev.event_poster} alt={ev.event_name} style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-info">{ev.category}</span>
                  <span className={`badge badge-${ev.status.replace(/\s+/g, '-')}`}>{ev.status}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.35rem 0' }}>{ev.event_name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', flex: 1, marginBottom: '1rem' }}>{ev.description.substring(0, 110)}...</p>

                {/* Progress bar for seat capacity */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    <span>Registered: {ev.registered_count} / {ev.max_participants}</span>
                    <span>{pct}% Full</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#ef4444' : '#2563eb', transition: 'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> {ev.event_date} ({ev.event_time})</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={14} /> {ev.venue}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" onClick={() => setSelectedEvent(ev)} style={{ flex: 1 }}>Details</button>
                  <button className="btn btn-primary" onClick={() => setActivePage('login')} style={{ flex: 1 }}>Register</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.event_name}>
        {selectedEvent && (
          <div>
            <img src={selectedEvent.event_poster} alt={selectedEvent.event_name} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-info">{selectedEvent.category}</span>
              <span className={`badge badge-${selectedEvent.status.replace(/\s+/g, '-')}`}>{selectedEvent.status}</span>
              <span className="badge badge-success">🏆 {selectedEvent.hours_allocated} Volunteer Hours</span>
            </div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Description:</h4>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>{selectedEvent.description}</p>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <div>📅 <strong>Date & Time:</strong> {selectedEvent.event_date} | {selectedEvent.event_time}</div>
              <div>📍 <strong>Venue:</strong> {selectedEvent.venue}</div>
              <div>🚩 <strong>Organizer:</strong> {selectedEvent.organizer}</div>
              <div>⏰ <strong>Registration Deadline:</strong> {selectedEvent.registration_deadline}</div>
            </div>
            {selectedEvent.instructions && (
              <div>
                <h5 style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Instructions for Volunteers:</h5>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>{selectedEvent.instructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
