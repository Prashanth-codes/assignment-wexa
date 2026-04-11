import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}