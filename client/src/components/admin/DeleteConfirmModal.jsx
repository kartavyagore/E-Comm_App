import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-danger)' }}>
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Confirm Deletion</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>"{productTitle}"</strong>?
          This action will remove the product and clean up associated Supabase S3 media. This cannot be undone.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} disabled={isDeleting} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn btn-danger btn-sm"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
