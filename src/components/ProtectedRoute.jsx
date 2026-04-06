import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute – enforces role-based access on the frontend.
 * Backend middleware (protect + authorizeRoles) is still the real security layer.
 * This prevents accidental navigation and gives instant feedback.
 */
export default function ProtectedRoute({ children, requiredRole }) {
    let user = null;
    try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
    } catch {
        localStorage.removeItem('user');
    }

    const token = localStorage.getItem('token');

    if (!token || !user) return <Navigate to="/login" replace />;
    if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

    return children;
}
