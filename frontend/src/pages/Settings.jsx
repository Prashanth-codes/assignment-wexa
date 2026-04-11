import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const [form, setForm] = useState({ organizationName: '', defaultLowStockThreshold: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { refreshUser } = useAuth();

  useEffect(() => {
    settingsAPI.get()
      .then((res) => {
        const s = res.data.settings;
        setForm({
          organizationName: s.organizationName || '',
          defaultLowStockThreshold: s.defaultLowStockThreshold !== undefined ? String(s.defaultLowStockThreshold) : '5',
        });
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.organizationName.trim()) e.organizationName = 'Organization name is required';
    if (form.defaultLowStockThreshold === '' || isNaN(Number(form.defaultLowStockThreshold)) || Number(form.defaultLowStockThreshold) < 0) {
      e.defaultLowStockThreshold = 'Must be a valid non-negative number';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await settingsAPI.update({
        organizationName: form.organizationName.trim(),
        defaultLowStockThreshold: Number(form.defaultLowStockThreshold),
      });
      await refreshUser();
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally { setSaving(false); }
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Update organization details and inventory defaults.</p>
          </div>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : (
            <div className="card animate-in" style={{ maxWidth: 560 }}>
              <div className="section-kicker">Organization</div>
              <div className="section-label" style={{ marginBottom: 20 }}>Organization Settings</div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Organization Name</label>
                  <input
                    value={form.organizationName}
                    onChange={set('organizationName')}
                    placeholder="Your store or company name"
                    className={errors.organizationName ? 'input-error' : ''}
                  />
                  {errors.organizationName && <p className="error-text">{errors.organizationName}</p>}
                </div>

                <div className="divider" />

                <div className="section-kicker">Inventory</div>
                <div className="section-label" style={{ marginBottom: 12 }}>Inventory Defaults</div>

                <div className="form-group">
                  <label>Default Low Stock Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={form.defaultLowStockThreshold}
                    onChange={set('defaultLowStockThreshold')}
                    placeholder="5"
                    style={{ maxWidth: 160 }}
                    className={errors.defaultLowStockThreshold ? 'input-error' : ''}
                  />
                  {errors.defaultLowStockThreshold && <p className="error-text">{errors.defaultLowStockThreshold}</p>}
                  <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>
                    Products without a specific threshold will use this value to determine low stock status.
                  </p>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}