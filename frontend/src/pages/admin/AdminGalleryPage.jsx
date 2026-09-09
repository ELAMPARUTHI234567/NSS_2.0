import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

export default function AdminGalleryPage() {
  const { showToast } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: 'Swachh Bharat Cleanliness Drive Campus Photos',
    category: 'Swachh Bharat',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
    nssUnitId: '1'
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await api.get('/gallery');
      if (res.success) setGallery(res.gallery || []);
    } catch (err) {}
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/gallery', form);
      if (res.success) {
        showToast(res.message, 'success');
        setCreateModalOpen(false);
        fetchGallery();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete photo from gallery?')) return;
    try {
      const res = await api.delete(`/gallery/${id}`);
      if (res.success) {
        showToast(res.message, 'info');
        fetchGallery();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Media & Gallery Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload activity photos and campaign banners to public photo gallery</p>
        </div>

        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} /> Upload Photo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {gallery.map(item => (
          <div key={item.id} className="card" style={{ overflow: 'hidden' }}>
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '0.85rem' }}>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{item.category}</span>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}>{item.title}</h4>
              <button className="btn btn-danger" onClick={() => handleDelete(item.id)} style={{ width: '100%', marginTop: '0.75rem', padding: '0.35rem', fontSize: '0.75rem' }}>
                <Trash2 size={14} /> Remove Photo
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Upload Photo to Gallery">
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Photo Title *</label>
            <input type="text" className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="Tree Plantation">Tree Plantation</option>
              <option value="Blood Donation">Blood Donation</option>
              <option value="Swachh Bharat">Swachh Bharat</option>
              <option value="Awareness Rally">Awareness Rally</option>
              <option value="Community Service">Community Service</option>
            </select>
          </div>
          <div className="form-group">
            <label>Image URL *</label>
            <input type="text" className="form-control" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} required />
          </div>
          <div className="modal-footer" style={{ padding: 0, marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Upload to Gallery</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
