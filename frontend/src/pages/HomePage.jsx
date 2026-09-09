import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import {
  Shield, Users, Award, Calendar, Megaphone, ArrowRight, ChevronLeft, ChevronRight,
  Trees, Droplet, HeartHandshake, Sparkles, CheckCircle2, Phone, Mail, MapPin, ExternalLink
} from 'lucide-react';

export default function HomePage({ setActivePage }) {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 245, activeVolunteers: 220, totalEvents: 32, totalHours: 1240, totalActivities: 24 });

  // Touch handling for mobile swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    // Fetch Homepage Banners
    api.get('/banners').then(res => {
      if (res.success && res.banners && res.banners.length > 0) {
        setBanners(res.banners);
      }
    }).catch(() => {
      // Fallback default slides if API fails
      setBanners([
        {
          id: 1,
          title: "Serve. Learn. Grow. Make a Difference.",
          subtitle: "Not Me But You",
          description: "Empowering youth through voluntary community service, leadership building, and nationwide social causes.",
          image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&auto=format&fit=crop&q=80",
          button_text: "Join NSS",
          button_link: "register"
        },
        {
          id: 2,
          title: "Green Earth Drive: Mass Tree Plantation",
          subtitle: "Environmental Stewardship",
          description: "Planting 500+ saplings across college campus & rural communities to promote biodiversity.",
          image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80",
          button_text: "Explore Events",
          button_link: "public-events"
        },
        {
          id: 3,
          title: "Voluntary Blood Donation Camp",
          subtitle: "Health & Lifesaving Initiative",
          description: "Over 150+ blood units donated annually in collaboration with Government Blood Banks.",
          image_url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1600&auto=format&fit=crop&q=80",
          button_text: "View Activities",
          button_link: "activities"
        }
      ]);
    });

    // Fetch Announcements
    api.get('/announcements').then(res => {
      if (res.success) setAnnouncements(res.announcements.slice(0, 3));
    }).catch(() => {});

    // Fetch Events
    api.get('/events?status=Registration%20Open').then(res => {
      if (res.success) setEvents(res.events.slice(0, 3));
    }).catch(() => {});
  }, []);

  // Automatic slide rotation every 5 seconds
  useEffect(() => {
    if (banners.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners, isPaused]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNextSlide(); // Swipe Left
    }
    if (touchEndX.current - touchStartX.current > 50) {
      handlePrevSlide(); // Swipe Right
    }
  };

  const currentBanner = banners[currentSlide] || {};

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      
      {/* 1. HERO BANNER / IMAGE SLIDER SECTION */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          minHeight: '520px',
          maxHeight: '680px',
          height: '70vh',
          background: '#0f172a',
          color: 'white',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Background Image Slides with Smooth Fade */}
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              pointerEvents: index === currentSlide ? 'auto' : 'none'
            }}
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.55)'
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&auto=format&fit=crop&q=80';
              }}
            />
            {/* Gradient Overlay for Text Readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.65) 50%, rgba(15,23,42,0.2) 100%)'
              }}
            />
          </div>
        ))}

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
          
          {/* NSS Official Header Bar in Banner */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '0.5rem 1.25rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.25)', marginBottom: '1.5rem' }}>
            <Shield size={20} style={{ color: '#fbbf24' }} />
            <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', color: '#fef08a' }}>
              NATIONAL SERVICE SCHEME — {currentBanner.subtitle || 'Not Me But You'}
            </div>
          </div>

          {/* Banner Main Title & Description */}
          <div style={{ maxWidth: '780px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1rem', color: '#ffffff', letterSpacing: '-0.5px', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {currentBanner.title || 'Serve. Learn. Grow. Make a Difference.'}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '680px' }}>
              {currentBanner.description || '"Not Me But You" — Empowering student youth through social responsibility, voluntary community service, and nation building.'}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => setActivePage(currentBanner.button_link || 'register')}
                style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800, padding: '0.9rem 2rem', fontSize: '1rem', border: 'none', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}
              >
                {currentBanner.button_text || 'Join NSS'} <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setActivePage('public-events')}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '0.9rem 2rem', fontSize: '1rem', backdropFilter: 'blur(4px)' }}
              >
                Explore Events
              </button>
            </div>
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              style={{
                position: 'absolute',
                left: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                background: 'rgba(15, 23, 42, 0.65)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextSlide}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                background: 'rgba(15, 23, 42, 0.65)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Bottom Pagination Indicator Dots */}
        {banners.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '0.65rem' }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: i === currentSlide ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  background: i === currentSlide ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. NSS LIVE STATISTICS SECTION */}
      <section style={{ background: '#1e3a8a', color: 'white', padding: '2.5rem 2rem', borderBottom: '4px solid #f59e0b' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fbbf24', margin: 0 }}>220+</h2>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: '0.35rem 0 0 0', fontWeight: 700 }}>Active Student Volunteers</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#4ade80', margin: 0 }}>1,240+</h2>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: '0.35rem 0 0 0', fontWeight: 700 }}>Volunteer Hours Logged</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>32+</h2>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: '0.35rem 0 0 0', fontWeight: 700 }}>Events Organized</p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f472b6', margin: 0 }}>24+</h2>
            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', margin: '0.35rem 0 0 0', fontWeight: 700 }}>Completed Activities</p>
          </div>
        </div>
      </section>

      {/* 3. NSS ACTIVITIES PILLARS */}
      <section style={{ maxWidth: '1400px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: '#d97706', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
            NSS Core Focus Areas
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>
            Empowering Youth for Social Transformation
          </h2>
          <p style={{ color: '#64748b', maxWidth: '650px', margin: '0.5rem auto 0 auto', fontSize: '1rem' }}>
            Student volunteers engage in structured programs that foster discipline, leadership, and lifelong civic responsibility.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: '1rem', borderTop: '4px solid #16a34a', transition: 'transform 0.3s' }}>
            <div style={{ width: '60px', height: '60px', background: '#dcfce7', color: '#15803d', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Trees size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>🌱 Environmental Care</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0.75rem 0 1.25rem 0' }}>
              Tree plantation drives, campus sanitation, plastic-free campaigns, and organic farming workshops.
            </p>
            <button className="btn btn-outline" onClick={() => setActivePage('activities')} style={{ width: '100%', fontSize: '0.85rem' }}>
              View Details &rarr;
            </button>
          </div>

          <div className="card" style={{ padding: '2rem', borderRadius: '1rem', borderTop: '4px solid #dc2626', transition: 'transform 0.3s' }}>
            <div style={{ width: '60px', height: '60px', background: '#fee2e2', color: '#b91c1c', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Droplet size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>🩸 Health & Blood Donation</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0.75rem 0 1.25rem 0' }}>
              Annual voluntary blood donation camps, free health check-up drives, and yoga & mental wellness programs.
            </p>
            <button className="btn btn-outline" onClick={() => setActivePage('activities')} style={{ width: '100%', fontSize: '0.85rem' }}>
              View Details &rarr;
            </button>
          </div>

          <div className="card" style={{ padding: '2rem', borderRadius: '1rem', borderTop: '4px solid #0284c7', transition: 'transform 0.3s' }}>
            <div style={{ width: '60px', height: '60px', background: '#e0f2fe', color: '#0369a1', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <HeartHandshake size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>🤝 Community Service</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0.75rem 0 1.25rem 0' }}>
              Adopted village development, adult literacy classes, orphanage support, and rural infrastructure building.
            </p>
            <button className="btn btn-outline" onClick={() => setActivePage('activities')} style={{ width: '100%', fontSize: '0.85rem' }}>
              View Details &rarr;
            </button>
          </div>

          <div className="card" style={{ padding: '2rem', borderRadius: '1rem', borderTop: '4px solid #d97706', transition: 'transform 0.3s' }}>
            <div style={{ width: '60px', height: '60px', background: '#fef3c7', color: '#b45309', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Megaphone size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>📢 Social Awareness</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0.75rem 0 1.25rem 0' }}>
              Awareness rallies on road safety, anti-drug abuse, digital literacy, and women empowerment.
            </p>
            <button className="btn btn-outline" onClick={() => setActivePage('activities')} style={{ width: '100%', fontSize: '0.85rem' }}>
              View Details &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS SECTION */}
      <section style={{ background: '#f8fafc', padding: '4rem 2rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: '#1e3a8a', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>
                Join Active Drives
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
                Upcoming NSS Events & Camps
              </h2>
            </div>
            <button className="btn btn-outline" onClick={() => setActivePage('public-events')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              View All Events <ExternalLink size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {events.map((ev) => (
              <div key={ev.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '1rem' }}>
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={ev.event_poster || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'}
                    alt={ev.event_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge badge-info" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#1e3a8a', color: 'white' }}>
                    {ev.category}
                  </span>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                    {ev.event_name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, flex: 1, marginBottom: '1.25rem' }}>
                    {ev.description ? ev.description.substring(0, 110) + '...' : 'Participate in this official NSS service event to earn volunteer hours.'}
                  </p>
                  <div style={{ fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ marginBottom: '0.25rem' }}>📅 <strong>Date:</strong> {ev.event_date} ({ev.event_time})</div>
                    <div>📍 <strong>Venue:</strong> {ev.venue}</div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActivePage('login')}
                    style={{ width: '100%', background: '#1e3a8a', fontWeight: 700 }}
                  >
                    Register for Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LATEST ANNOUNCEMENTS */}
      <section style={{ maxWidth: '1400px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '42px', height: '42px', background: '#fef3c7', color: '#b45309', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Official Announcements</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Important notices from the NSS Central Office</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {announcements.map((anc) => (
            <div key={anc.id} className="card" style={{ padding: '1.5rem', borderRadius: '0.75rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={`badge badge-${anc.priority === 'Urgent' ? 'danger' : 'warning'}`}>
                  {anc.priority}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(anc.publish_date).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0' }}>
                {anc.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                {anc.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #0f2b5c 0%, #1e3a8a 100%)', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fbbf24', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Ready to Serve the Nation?
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '1rem', marginBottom: '1rem' }}>
            Become a Registered NSS Volunteer Today
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem' }}>
            Join 220+ active student volunteers. Earn government-recognized certificates, participate in national camps, and make a lasting impact in society.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActivePage('register')} style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800, padding: '0.9rem 2.25rem', fontSize: '1rem', border: 'none' }}>
              Register Now <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline" onClick={() => setActivePage('contact')} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', padding: '0.9rem 2rem', fontSize: '1rem' }}>
              Contact NSS Office
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
