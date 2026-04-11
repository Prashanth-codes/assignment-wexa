import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal confirm-modal">
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--red)' }}>{title || 'Confirm Action'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="confirm-message">{message}</p>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}