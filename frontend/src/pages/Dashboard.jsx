import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

function LowStockRow({ product, defaultThreshold }) {
  const threshold = product.lowStockThreshold !== null ? product.lowStockThreshold : defaultThreshold;
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 500, color: 'var(--text)' }}>{product.name}</div>
      </td>
      <td><span className="sku-tag">{product.sku}</span></td>
      <td>
        <span className="qty-display qty-low">{product.quantityOnHand}</span>
      </td>
      <td>
        <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{threshold}</span>
      </td>
      <td>
        {product.quantityOnHand === 0
          ? <span className="badge badge-red">Out of stock</span>
          : <span className="badge badge-amber">Low stock</span>}
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.dashboard()
      .then((res) => setData(res.data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const defaultThreshold = user?.organization?.defaultLowStockThreshold ?? 5;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Create Product
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : (
            <>
              <div className="stats-grid animate-in">
                <div className="stat-card purple">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value">{data?.totalProducts ?? 0}</div>
                  <div className="stat-icon">PR</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Units in Stock</div>
                  <div className="stat-value">{data?.totalQuantity ?? 0}</div>
                  <div className="stat-icon">ST</div>
                </div>
                <div className="stat-card amber">
                  <div className="stat-label">Low Stock Alerts</div>
                  <div className="stat-value">{data?.lowStockCount ?? 0}</div>
                  <div className="stat-icon">AL</div>
                </div>
              </div>

              <div className="card animate-in" style={{ marginTop: 0 }}>
                <div className="section-label">
                  Low Stock Items
                  {data?.lowStockCount > 0 && (
                    <span className="badge badge-amber" style={{ marginLeft: 8 }}>{data.lowStockCount}</span>
                  )}
                </div>

                {!data?.lowStockItems?.length ? (
                  <div className="empty-state" style={{ padding: '32px 0' }}>
                    <div className="empty-icon">OK</div>
                    <div className="empty-title">All stocked up!</div>
                    <div className="empty-desc">No products are below their low stock threshold.</div>
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Qty on Hand</th>
                          <th>Threshold</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.lowStockItems.map((p) => (
                          <LowStockRow key={p._id} product={p} defaultThreshold={defaultThreshold} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}