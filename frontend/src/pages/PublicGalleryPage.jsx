import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import { Image as ImageIcon, Filter } from 'lucide-react';

export default function PublicGalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [category, setCategory] = useState('All');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    api.get('/gallery').then(res => {
      if (res.success) setGallery(res.gallery || []);
    }).catch(() => {});
  }, []);

  const categories = ['All', 'Tree Plantation', 'Blood Donation', 'Community Service', 'Awareness Rally'];

  const filtered = category === 'All'
    ? gallery
    : gallery.filter(g => g.category === category);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>NSS Activity Gallery</h1>
        <p style={{ color: '#64748b' }}>Photo and media archives of NSS voluntary service drives</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`btn ${category === c ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem' }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(item => (
          <div
            key={item.id}
            className="card"
            onClick={() => setPreviewImage(item)}
            style={{ overflow: 'hidden', cursor: 'pointer' }}
          >
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            <div style={{ padding: '0.85rem' }}>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{item.category}</span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.25rem' }}>{item.title}</h4>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage?.title}>
        {previewImage && (
          <div>
            <img src={previewImage.image_url} alt={previewImage.title} style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Category: <strong>{previewImage.category}</strong></span>
              <span>Uploaded By: <strong>{previewImage.uploaded_by}</strong></span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
