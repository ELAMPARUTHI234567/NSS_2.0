import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Info, Save, CheckCircle } from 'lucide-react';

export default function AdminNssInfoPage() {
  const { showToast } = useAuth();
  const [sections, setSections] = useState({
    about: { title: 'About National Service Scheme', content: '' },
    motto: { title: 'NSS Motto', content: 'Not Me But You' },
    vision: { title: 'Vision', content: '' },
    mission: { title: 'Mission', content: '' },
    rules: { title: 'Volunteer Guidelines & Rules', content: '' }
  });

  useEffect(() => {
    fetchNssInfo();
  }, []);

  const fetchNssInfo = async () => {
    try {
      const res = await api.get('/nss-info');
      if (res.success && res.info) {
        setSections(prev => ({ ...prev, ...res.info }));
      }
    } catch (err) {}
  };

  const handleSaveSection = async (sectionKey) => {
    try {
      const sec = sections[sectionKey];
      const res = await api.put(`/nss-info/${sectionKey}`, {
        title: sec.title,
        content: sec.content,
        published: 1
      });
      if (res.success) {
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>NSS Information & Content Management</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Edit About NSS, Motto, Vision, Mission, and Volunteer Rules published to live website</p>
      </div>

      {Object.keys(sections).map(key => (
        <div key={key} className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'capitalize', color: '#0f2b5c' }}>
              Section: {key}
            </h3>
            <button className="btn btn-primary" onClick={() => handleSaveSection(key)} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              <Save size={14} /> Save & Publish
            </button>
          </div>
          <div className="form-group">
            <label>Section Title</label>
            <input
              type="text"
              className="form-control"
              value={sections[key].title}
              onChange={e => setSections({ ...sections, [key]: { ...sections[key], title: e.target.value } })}
            />
          </div>
          <div className="form-group">
            <label>Section Content</label>
            <textarea
              className="form-control"
              rows="4"
              value={sections[key].content}
              onChange={e => setSections({ ...sections, [key]: { ...sections[key], content: e.target.value } })}
            ></textarea>
          </div>
        </div>
      ))}
    </div>
  );
}
