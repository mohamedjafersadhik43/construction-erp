import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <span className="brand-icon">🏗️</span>
                    <span className="brand-text">Construction ERP</span>
                </Link>

                <div className="navbar-menu">
                    <Link to="/dashboard" className="nav-link">
                        <span>📊</span> Dashboard
                    </Link>
                    <Link to="/projects" className="nav-link">
                        <span>🏗️</span> Projects
                    </Link>
                    <Link to="/finance" className="nav-link">
                        <span>💰</span> Finance
                    </Link>
                    {user?.role === 'Admin' && (
                        <Link to="/admin" className="nav-link">
                            <span>⚙️</span> Admin
                        </Link>
                    )}
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-name">{user?.username}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
