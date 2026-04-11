import React, { useState, useEffect } from 'react';

const EMPTY = { name: '', sku: '', description: '', quantityOnHand: '', costPrice: '', sellingPrice: '', lowStockThreshold: '' };

export default function ProductModal({ isOpen, onClose, onSave, product, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        quantityOnHand: product.quantityOnHand !== undefined ? String(product.quantityOnHand) : '0',
        costPrice: product.costPrice !== null && product.costPrice !== undefined ? String(product.costPrice) : '',
        sellingPrice: product.sellingPrice !== null && product.sellingPrice !== undefined ? String(product.sellingPrice) : '',
        lowStockThreshold: product.lowStockThreshold !== null && product.lowStockThreshold !== undefined ? String(product.lowStockThreshold) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (form.quantityOnHand === '' || Number(form.quantityOnHand) < 0) e.quantityOnHand = 'Valid quantity required';
    if (form.costPrice !== '' && isNaN(Number(form.costPrice))) e.costPrice = 'Must be a number';
    if (form.sellingPrice !== '' && isNaN(Number(form.sellingPrice))) e.sellingPrice = 'Must be a number';
    if (form.lowStockThreshold !== '' && isNaN(Number(form.lowStockThreshold))) e.lowStockThreshold = 'Must be a number';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      quantityOnHand: Number(form.quantityOnHand),
      costPrice: form.costPrice !== '' ? Number(form.costPrice) : null,
      sellingPrice: form.sellingPrice !== '' ? Number(form.sellingPrice) : null,
      lowStockThreshold: form.lowStockThreshold !== '' ? Number(form.lowStockThreshold) : null,
    });
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Create Product'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Product Name *</label>
                <input value={form.name} onChange={set('name')} placeholder="e.g. Blue Widget" className={errors.name ? 'input-error' : ''} />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label>SKU *</label>
                <input value={form.sku} onChange={set('sku')} placeholder="e.g. BLU-WGT-001" className={errors.sku ? 'input-error' : ''} style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }} />
                {errors.sku && <p className="error-text">{errors.sku}</p>}
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={set('description')} placeholder="Optional product description" rows={2} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Quantity on Hand *</label>
                <input type="number" min="0" value={form.quantityOnHand} onChange={set('quantityOnHand')} placeholder="0" className={errors.quantityOnHand ? 'input-error' : ''} />
                {errors.quantityOnHand && <p className="error-text">{errors.quantityOnHand}</p>}
              </div>
              <div className="form-group">
                <label>Cost Price</label>
                <input type="number" step="0.01" min="0" value={form.costPrice} onChange={set('costPrice')} placeholder="0.00" className={errors.costPrice ? 'input-error' : ''} />
                {errors.costPrice && <p className="error-text">{errors.costPrice}</p>}
              </div>
              <div className="form-group">
                <label>Selling Price</label>
                <input type="number" step="0.01" min="0" value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="0.00" className={errors.sellingPrice ? 'input-error' : ''} />
                {errors.sellingPrice && <p className="error-text">{errors.sellingPrice}</p>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Low Stock Threshold</label>
              <input type="number" min="0" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} placeholder="Leave blank to use global default" className={errors.lowStockThreshold ? 'input-error' : ''} />
              {errors.lowStockThreshold && <p className="error-text">{errors.lowStockThreshold}</p>}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : (isEdit ? 'Save Changes' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}