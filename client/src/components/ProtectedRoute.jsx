import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="container" style={{ marginTop: '2rem' }}>
                <div className="card text-center">
                    <h2>Access Denied</h2>
                    <p className="text-muted">You don't have permission to access this page.</p>
                    <p className="text-muted">Required role: {requiredRole}</p>
                    <p className="text-muted">Your role: {user?.role}</p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
