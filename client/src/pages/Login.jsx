import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'User',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const result = await login(formData.username, formData.password);
                if (result.success) {
                    navigate('/dashboard');
                } else {
                    setError(result.error);
                }
            } else {
                const result = await register(formData);
                if (result.success) {
                    setError('');
                    alert('Registration successful! Please login.');
                    setIsLogin(true);
                    setFormData({ username: '', email: '', password: '', role: 'User' });
                } else {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-icon">🏗️</div>
                        <h1>Construction ERP</h1>
                        <p className="login-subtitle">
                            {isLogin ? 'Welcome back!' : 'Create your account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="error-message fade-in">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    name="role"
                                    className="form-select"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="User">User</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? (
                                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                            ) : isLogin ? (
                                'Login'
                            ) : (
                                'Register'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setFormData({ username: '', email: '', password: '', role: 'User' });
                                }}
                            >
                                {isLogin ? 'Register' : 'Login'}
                            </button>
                        </p>
                    </div>

                    {isLogin && (
                        <div className="demo-credentials">
                            <p className="text-muted">Demo Credentials:</p>
                            <p className="text-muted">Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                        </div>
                    )}
                </div>

                <div className="login-background">
                    <div className="bg-circle circle-1"></div>
                    <div className="bg-circle circle-2"></div>
                    <div className="bg-circle circle-3"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
