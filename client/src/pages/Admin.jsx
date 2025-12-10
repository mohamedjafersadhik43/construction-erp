import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
    const { user } = useAuth();

    return (
        <>
            <Navbar />
            <div className="admin-page">
                <div className="container">
                    <div className="page-header">
                        <div>
                            <h1>Admin Panel</h1>
                            <p className="text-muted">System administration and settings</p>
                        </div>
                    </div>

                    <div className="grid grid-3 fade-in">
                        <div className="admin-card">
                            <div className="admin-icon">👥</div>
                            <h3>User Management</h3>
                            <p className="text-muted">Manage system users and permissions</p>
                            <div className="admin-stat">
                                <span className="stat-label">Total Users</span>
                                <span className="stat-value">Coming Soon</span>
                            </div>
                        </div>

                        <div className="admin-card">
                            <div className="admin-icon">📊</div>
                            <h3>System Reports</h3>
                            <p className="text-muted">Generate financial and project reports</p>
                            <div className="admin-stat">
                                <span className="stat-label">Reports Generated</span>
                                <span className="stat-value">Coming Soon</span>
                            </div>
                        </div>

                        <div className="admin-card">
                            <div className="admin-icon">⚙️</div>
                            <h3>Settings</h3>
                            <p className="text-muted">Configure system preferences</p>
                            <div className="admin-stat">
                                <span className="stat-label">Last Updated</span>
                                <span className="stat-value">Today</span>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-4 fade-in">
                        <h3>Current User Information</h3>
                        <div className="user-info-grid">
                            <div className="info-item">
                                <span className="info-label">Username</span>
                                <span className="info-value">{user?.username}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Email</span>
                                <span className="info-value">{user?.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Role</span>
                                <span className="badge badge-primary">{user?.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-4 fade-in">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
                            <button className="btn btn-primary">
                                <span>📥</span> Export Data
                            </button>
                            <button className="btn btn-secondary">
                                <span>🔄</span> Sync Database
                            </button>
                            <button className="btn btn-outline">
                                <span>📧</span> Send Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;
