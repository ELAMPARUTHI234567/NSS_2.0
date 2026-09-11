import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, UploadCloud, X, Check, RefreshCw } from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fileInfo, setFileInfo] = useState(null);

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
    setSelectedFile(null);

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
      setImagePreview(banner.image_url || '');
      setFileInfo(banner.image_url ? { name: 'Current Banner Photo', size: '' } : null);
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
      setImagePreview('');
      setFileInfo(null);
    }
    setIsModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate File Format (JPG, JPEG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP photo.');
      return;
    }

    // Validate File Size (Maximum 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 5 MB. Please select a smaller photo.');
      return;
    }

    setError('');
    setSelectedFile(file);

    const sizeKb = (file.size / 1024).toFixed(1);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const formattedSize = file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;
    setFileInfo({ name: file.name, size: formattedSize });

    // Generate local Data URI preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFileInfo(null);
    setFormData((prev) => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    if (!formData.title.trim()) {
      setError('Banner Title is required.');
      return;
    }

    if (!imagePreview && !selectedFile && !formData.image_url) {
      setError('Please select an image photo for the banner.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let finalImageUrl = formData.image_url;

      // Upload file via FormData to backend POST /api/banners/upload
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        try {
          const uploadRes = await api.post('/banners/upload', uploadData);
          if (uploadRes.success && uploadRes.image_url) {
            finalImageUrl = uploadRes.image_url;
          }
        } catch (uploadErr) {
          // Fallback to Data URI if multipart response has issue
          finalImageUrl = imagePreview;
        }
      } else if (imagePreview) {
        finalImageUrl = imagePreview;
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl
      };

      if (editingBanner) {
        const res = await api.put(`/banners/admin/${editingBanner.id}`, payload);
        if (res.success) {
          setSuccess('Homepage banner updated successfully!');
          setIsModalOpen(false);
          fetchBanners();
        }
      } else {
        const res = await api.post('/banners/admin', payload);
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
            Upload, manage, and reorder automatic hero activity slides displayed on the public NSS homepage.
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
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Click "Add New Banner" above to upload hero slides for the public website.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {banners.map((banner) => (
            <div key={banner.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', border: banner.is_active ? '1px solid #cbd5e1' : '1px dashed #cbd5e1', opacity: banner.is_active ? 1 : 0.75 }}>
              {/* Banner Image Preview */}
              <div style={{ position: 'relative', height: '180px', background: '#0f172a' }}>
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.opacity = '0.3'; }}
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

            {/* DIRECT PHOTO UPLOAD SECTION */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Banner Image *
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {!imagePreview ? (
                <div
                  onClick={handleChangeImage}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '0.75rem',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#1e3a8a')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  <UploadCloud size={36} style={{ color: '#1e3a8a', margin: '0 auto 0.75rem auto' }} />
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    [ 📷 Choose Photo ]
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Supported formats: JPG, JPEG, PNG, WEBP
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Maximum size: 5 MB
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', height: '180px', background: '#0f172a', marginBottom: '0.75rem' }}>
                    <img
                      src={imagePreview}
                      alt="Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.opacity = '0.3'; }}
                    />
                  </div>

                  {fileInfo && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}>
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        📷 {fileInfo.name}
                      </span>
                      {fileInfo.size && (
                        <span style={{ fontWeight: 700, color: '#1e3a8a', marginLeft: '0.5rem' }}>
                          {fileInfo.size}
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleChangeImage}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                    >
                      <UploadCloud size={14} /> [ Change Image ]
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 0.85rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <X size={14} /> [ Remove Image ]
                    </button>
                  </div>
                </div>
              )}
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
            {imagePreview && (
              <div style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '1.25rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 800 }}>
                    Live Homepage Preview
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
                {saving ? 'Saving Banner...' : editingBanner ? 'Save Changes' : 'Create Banner'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
