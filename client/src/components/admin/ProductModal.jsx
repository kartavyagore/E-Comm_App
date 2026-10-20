import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';

export const ProductModal = ({ isOpen, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    category_name: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    storage_path: null,
    cloudinary_public_id: null,
    description: '',
    is_featured: false,
    spec_driver: '',
    spec_freq: '',
    spec_connectivity: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        category_id: product.category_id || '',
        category_name: product.category_name || '',
        price: product.price || '',
        stock_quantity: product.stock_quantity ?? '',
        image_url: product.image_url || '',
        storage_path: product.storage_path || product.cloudinary_public_id || null,
        cloudinary_public_id: product.storage_path || product.cloudinary_public_id || null,
        description: product.description || '',
        is_featured: Boolean(product.is_featured),
        spec_driver: product.specifications?.driver || '',
        spec_freq: product.specifications?.frequency_response || '',
        spec_connectivity: product.specifications?.connectivity || ''
      });
    } else {
      setFormData({
        title: '',
        category_id: categories[0]?.id || '',
        category_name: categories[0]?.name || '',
        price: '',
        stock_quantity: '10',
        image_url: '',
        storage_path: null,
        cloudinary_public_id: null,
        description: '',
        is_featured: false,
        spec_driver: '',
        spec_freq: '',
        spec_connectivity: ''
      });
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      category_name: cat ? cat.name : ''
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPEG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds maximum limit of 5MB.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const res = await adminService.uploadImage(file);
      const imageUrl = res?.image_url || res?.data?.image_url;
      const storagePath = res?.storage_path || res?.data?.storage_path || res?.public_id || res?.data?.public_id || null;

      if (!imageUrl) {
        throw new Error('Image upload failed to return a valid URL.');
      }

      setFormData((prev) => ({
        ...prev,
        image_url: imageUrl,
        storage_path: storagePath,
        cloudinary_public_id: storagePath
      }));
      showToast('Image uploaded successfully to Supabase S3 bucket!', 'success');
    } catch (err) {
      showToast(err.message || 'Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Product title is required.', 'error');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      showToast('Valid price is required.', 'error');
      return;
    }
    if (!formData.image_url.trim()) {
      showToast('Product image is required (upload or provide URL).', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalStoragePath = formData.storage_path || formData.cloudinary_public_id;
      const payload = {
        title: formData.title.trim(),
        category_id: formData.category_id || categories[0]?.id,
        category_name: formData.category_name || categories[0]?.name,
        price: Number(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        image_url: formData.image_url.trim(),
        storage_path: finalStoragePath,
        cloudinary_public_id: finalStoragePath,
        description: formData.description.trim(),
        is_featured: formData.is_featured,
        specifications: {
          ...(formData.spec_driver && { driver: formData.spec_driver.trim() }),
          ...(formData.spec_freq && { frequency_response: formData.spec_freq.trim() }),
          ...(formData.spec_connectivity && { connectivity: formData.spec_connectivity.trim() })
        }
      };

      await onSave(payload, product?.id);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            {product ? 'Edit Acoustic Product' : 'Add New Product to Catalog'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AURA Apex Open-Back Reference Headphones"
              style={{ width: '100%' }}
            />
          </div>

          {/* Category & Price Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={handleCategoryChange}
                style={{ width: '100%', height: '44px' }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="499.00"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Stock & Featured Flag Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Stock Units Available *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="20"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.2rem' }}>
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
              />
              <label htmlFor="is_featured" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                Feature on Homepage
              </label>
            </div>
          </div>

          {/* Supabase S3 Storage Image Upload Section */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Product Image (Supabase S3 Bucket) *
            </label>

            {/* Dropzone */}
            <div
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                background: 'var(--bg-surface-elevated)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              {isUploading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-gold)' }}>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Uploading to Supabase S3 bucket...</span>
                </div>
              ) : formData.image_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: '#8bd396', fontWeight: 600 }}>✓ Image Connected</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formData.image_url}
                    </div>
                  </div>
                  <label
                    htmlFor="image-file-input"
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    Replace
                  </label>
                </div>
              ) : (
                <>
                  <UploadCloud size={32} color="var(--accent-gold)" />
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Drag & drop or <span style={{ color: 'var(--accent-gold)', cursor: 'pointer' }}>browse file</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports JPEG, PNG, WEBP up to 5MB. Uploads securely to Supabase S3 bucket.
                  </div>
                </>
              )}

              <input
                id="image-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  height: '100%',
                  ...(formData.image_url && { pointerEvents: 'none' })
                }}
              />
            </div>

            {/* Direct URL input fallback */}
            <div style={{ marginTop: '0.6rem' }}>
              <input
                type="text"
                placeholder="Or paste an image URL directly (e.g. Supabase Storage CDN / Unsplash)"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                style={{ width: '100%', fontSize: '0.82rem', padding: '0.55rem 0.85rem' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Acoustic Description *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed acoustic tuning, materials, driver architecture, and soundstage characteristics..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Specifications (Optional) */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'block', marginBottom: '0.6rem' }}>
              Audio Specifications (Optional)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Driver (e.g. 90mm Planar)"
                value={formData.spec_driver}
                onChange={(e) => setFormData({ ...formData, spec_driver: e.target.value })}
                style={{ fontSize: '0.8rem' }}
              />
              <input
                type="text"
                placeholder="Freq (e.g. 10Hz - 48kHz)"
                value={formData.spec_freq}
                onChange={(e) => setFormData({ ...formData, spec_freq: e.target.value })}
                style={{ fontSize: '0.8rem' }}
              />
              <input
                type="text"
                placeholder="Connectivity (e.g. 4.4mm / BT)"
                value={formData.spec_connectivity}
                onChange={(e) => setFormData({ ...formData, spec_connectivity: e.target.value })}
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isUploading} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
