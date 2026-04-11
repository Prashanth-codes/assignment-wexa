import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ProductModal from '../components/ProductModal';
import AdjustStockModal from '../components/AdjustStockModal';
import ConfirmModal from '../components/ConfirmModal';

function QtyCell({ qty, threshold, defaultThreshold }) {
  const t = threshold !== null && threshold !== undefined ? threshold : defaultThreshold;
  if (qty === 0) return <span className="qty-display qty-low">0</span>;
  if (qty <= t) return <span className="qty-display qty-warn">{qty}</span>;
  return <span className="qty-display qty-ok">{qty}</span>;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const { user } = useAuth();
  const defaultThreshold = user?.organization?.defaultLowStockThreshold ?? 5;
  const lowStockCount = products.filter((p) => {
    const threshold = p.lowStockThreshold !== null && p.lowStockThreshold !== undefined ? p.lowStockThreshold : defaultThreshold;
    return p.quantityOnHand > 0 && p.quantityOnHand <= threshold;
  }).length;
  const outOfStockCount = products.filter((p) => p.quantityOnHand === 0).length;
  const inStockCount = products.length - lowStockCount - outOfStockCount;

  const fetchProducts = useCallback(async (q = '') => {
    try {
      const res = await productsAPI.getAll(q);
      setProducts(res.data.products);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchProducts]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await productsAPI.create(data);
      toast.success('Product added!');
      setShowAdd(false);
      fetchProducts(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await productsAPI.update(editProduct._id, data);
      toast.success('Product updated!');
      setEditProduct(null);
      fetchProducts(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally { setSaving(false); }
  };

  const handleAdjust = async ({ adjustment, note }) => {
    setSaving(true);
    try {
      await productsAPI.adjustStock(adjustProduct._id, { adjustment, note });
      toast.success(`Stock adjusted: ${adjustment > 0 ? '+' : ''}${adjustment} units`);
      setAdjustProduct(null);
      fetchProducts(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await productsAPI.delete(deleteProduct._id);
      toast.success('Product deleted');
      setDeleteProduct(null);
      fetchProducts(search);
    } catch {
      toast.error('Failed to delete product');
    } finally { setSaving(false); }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} in your inventory</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
        </div>

        <div className="page-body">
          <div className="mini-stats animate-in">
            <div className="mini-stat in">
              <div className="mini-stat-label">In Stock</div>
              <div className="mini-stat-value">{inStockCount}</div>
            </div>
            <div className="mini-stat low">
              <div className="mini-stat-label">Low Stock</div>
              <div className="mini-stat-value">{lowStockCount}</div>
            </div>
            <div className="mini-stat out">
              <div className="mini-stat-label">Out of Stock</div>
              <div className="mini-stat-value">{outOfStockCount}</div>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-bar">
              <span className="search-icon">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU…"
              />
            </div>
            <div style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {products.length} results
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : products.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">◫</div>
                <div className="empty-title">{search ? 'No products found' : 'No products yet'}</div>
                <div className="empty-desc">{search ? 'Try a different search term' : 'Add your first product to get started'}</div>
                {!search && (
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
                    + Add First Product
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="table-container animate-in">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty on Hand</th>
                    <th>Selling Price</th>
                    <th>Cost Price</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const threshold = p.lowStockThreshold !== null && p.lowStockThreshold !== undefined ? p.lowStockThreshold : defaultThreshold;
                    const isLow = p.quantityOnHand <= threshold;
                    const isOut = p.quantityOnHand === 0;
                    return (
                      <tr key={p._id}>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                          {p.description && <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 2 }}>{p.description}</div>}
                        </td>
                        <td><span className="sku-tag">{p.sku}</span></td>
                        <td>
                          <QtyCell qty={p.quantityOnHand} threshold={p.lowStockThreshold} defaultThreshold={defaultThreshold} />
                        </td>
                        <td>
                          <span className="price">{p.sellingPrice !== null ? `$${Number(p.sellingPrice).toFixed(2)}` : <span style={{ color: 'var(--text-3)' }}>—</span>}</span>
                        </td>
                        <td>
                          <span className="price">{p.costPrice !== null ? `$${Number(p.costPrice).toFixed(2)}` : <span style={{ color: 'var(--text-3)' }}>—</span>}</span>
                        </td>
                        <td>
                          {isOut
                            ? <span className="badge badge-red">Out of Stock</span>
                            : isLow
                            ? <span className="badge badge-amber">Low Stock</span>
                            : <span className="badge badge-green">In Stock</span>}
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-ghost btn-sm" title="Adjust stock" onClick={() => setAdjustProduct(p)}>Adjust</button>
                            <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEditProduct(p)}>Edit</button>
                            <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--red)' }} onClick={() => setDeleteProduct(p)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ProductModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSave={handleCreate} product={null} loading={saving} />
      <ProductModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} onSave={handleUpdate} product={editProduct} loading={saving} />
      <AdjustStockModal isOpen={!!adjustProduct} onClose={() => setAdjustProduct(null)} onSave={handleAdjust} product={adjustProduct} loading={saving} />
      <ConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
        loading={saving}
      />
    </div>
  );
}