import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, ArrowUp, ArrowDown, Check, RefreshCw } from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    button_text: 'Explore Events',
    button_link: 'public-events',
    display_order: 1,
    is_active: 1
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners?all=true');
      if (res.success) {
        setBanners(res.banners || []);
      }
    } catch (err) {
      console.error('Fetch banners error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    setError('');
    setSuccess('');
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        image_url: banner.image_url || '',
        button_text: banner.button_text || 'Explore Events',
        button_link: banner.button_link || 'public-events',
        display_order: banner.display_order || 1,
        is_active: banner.is_active ? 1 : 0
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        button_text: 'Explore Events',
        button_link: 'public-events',
        display_order: (banners.length + 1),
        is_active: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (banner) => {
    try {
      const newStatus = banner.is_active ? 0 : 1;
      const res = await api.patch(`/banners/admin/${banner.id}/status`, { is_active: newStatus });
      if (res.success) {
        setSuccess(`Banner ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchBanners();
      }
    } catch (err) {
      setError(err.message || 'Failed to update banner status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this homepage banner?')) return;
    try {
      const res = await api.delete(`/banners/admin/${id}`);
      if (res.success) {
        setSuccess('Banner deleted successfully!');
        fetchBanners();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete banner.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      setError('Banner Title and Image URL are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingBanner) {
        const res = await api.put(`/banners/admin/${editingBanner.id}`, formData);
        if (res.success) {
          setSuccess('Homepage banner updated successfully!');
          setIsModalOpen(false);
          fetchBanners();
        }
      } else {
        const res = await api.post('/banners/admin', formData);
        if (res.success) {
          setSuccess('New homepage banner created successfully!');
          setIsModalOpen(false);
          fetchBanners();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Homepage Banner Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage and reorder automatic hero activity slides displayed on the public NSS homepage.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={fetchBanners} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e3a8a' }}>
            <Plus size={18} /> Add New Banner
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.85rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.85rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Banners Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading homepage banners...</div>
      ) : banners.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <ImageIcon size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Banners Created Yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Click "Add New Banner" above to create hero slides for the public website.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {banners.map((banner, index) => (
            <div key={banner.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', border: banner.is_active ? '1px solid #cbd5e1' : '1px dashed #cbd5e1', opacity: banner.is_active ? 1 : 0.75 }}>
              {/* Banner Image Preview */}
              <div style={{ position: 'relative', height: '180px', background: '#0f172a' }}>
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80'; }}
                />
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#1e3a8a', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                  Order #{banner.display_order}
                </div>
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`badge badge-${banner.is_active ? 'success' : 'secondary'}`}
                    style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem' }}
                  >
                    {banner.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {/* Banner Details */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {banner.subtitle && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', tracking: '0.05em' }}>
                    {banner.subtitle}
                  </span>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem 0' }}>
                  {banner.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', flex: 1, lineHeight: 1.5, marginBottom: '1rem' }}>
                  {banner.description || 'No description provided.'}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                  <strong>Button:</strong> "{banner.button_text || 'Explore Events'}" &rarr; <code style={{ color: '#1e3a8a' }}>{banner.button_link || 'public-events'}</code>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="btn btn-outline"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Edit Banner
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                    title="Delete Banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBanner ? 'Edit Homepage Banner' : 'Add New Homepage Banner'}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Banner Main Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Serve. Learn. Grow. Make a Difference."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Subtitle / Motto
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Not Me But You"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Display Order
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Description Text
              </label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Enter description highlighting this NSS initiative..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Banner Image URL *
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Button Label
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Join NSS or Explore Events"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Button Navigation Link
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. register, public-events, activities, contact"
                  value={formData.button_link}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="is_active_check"
                checked={!!formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="is_active_check" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                Set as Active Slide (Visible on public homepage)
              </label>
            </div>

            {/* Live Banner Preview Box */}
            {formData.image_url && (
              <div style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '1.25rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
                  <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 800 }}>
                    Live Preview
                  </span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.5rem' }}>{formData.title || 'Banner Title'}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: '0.25rem 0 0.75rem 0' }}>{formData.description || 'Banner Description'}</p>
                  <button className="btn btn-primary" style={{ background: '#f59e0b', color: '#0f172a', fontSize: '0.8rem', padding: '0.4rem 0.85rem', border: 'none' }} type="button">
                    {formData.button_text || 'Explore Events'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: '#1e3a8a' }} disabled={saving}>
                {saving ? 'Saving...' : editingBanner ? 'Save Changes' : 'Create Banner'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
