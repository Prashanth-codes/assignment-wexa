import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'DB', label: 'Dashboard' },
  { path: '/products', icon: 'PR', label: 'Products' },
  { path: '/settings', icon: 'ST', label: 'Settings' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">SF</div>
          <span className="logo-text">Stock<span>Flow</span></span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${pathname.startsWith(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="org-badge">
            <div className="org-name">{user.organization?.name}</div>
            <div className="org-email">{user.email}</div>
          </div>
        )}
        <button className="nav-item" onClick={handleLogout}>
          <span className="nav-icon">LO</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}