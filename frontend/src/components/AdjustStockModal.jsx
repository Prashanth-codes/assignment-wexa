import React, { useState } from 'react';

export default function AdjustStockModal({ isOpen, onClose, onSave, product, loading }) {
  const [adjustment, setAdjustment] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const reset = () => { setAdjustment(''); setNote(''); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adjustment === '' || isNaN(Number(adjustment))) { setError('Enter a valid number (for example: +10 or -5)'); return; }
    const num = Number(adjustment);
    const newQty = (product?.quantityOnHand || 0) + num;
    if (newQty < 0) { setError(`Cannot reduce below 0. Current qty: ${product.quantityOnHand}`); return; }
    onSave({ adjustment: num, note });
    reset();
  };

  if (!isOpen || !product) return null;

  const preview = adjustment !== '' && !isNaN(Number(adjustment))
    ? Math.max(0, (product.quantityOnHand || 0) + Number(adjustment))
    : null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal confirm-modal">
        <div className="modal-header">
          <h2 className="modal-title">Adjust Stock</h2>
          <button className="btn btn-ghost btn-sm" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
            <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 2 }}>
              Current qty: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{product.quantityOnHand}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adjustment (+ to add, - to remove)</label>
              <input
                type="number"
                value={adjustment}
                onChange={(e) => { setAdjustment(e.target.value); setError(''); }}
                placeholder="+10 or -5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 16 }}
                autoFocus
              />
              {error && <p className="error-text">{error}</p>}
              {preview !== null && (
                <p style={{ color: 'var(--accent-2)', fontSize: 12, marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                  New quantity: {preview}
                </p>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Note (optional)</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Received shipment, sold batch…"
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Apply Adjustment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}