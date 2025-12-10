import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { financeAPI, projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Finance.css';

const Finance = () => {
    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('invoices');
    const { hasAnyRole } = useAuth();

    const [formData, setFormData] = useState({
        project_id: '',
        invoice_number: '',
        client_name: '',
        amount: '',
        due_date: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invoicesRes, projectsRes, accountsRes] = await Promise.all([
                financeAPI.getInvoices(),
                projectsAPI.getAll(),
                financeAPI.getAccounts(),
            ]);

            setInvoices(invoicesRes.data.invoices);
            setProjects(projectsRes.data.projects);
            setAccounts(accountsRes.data.accounts);
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await financeAPI.createInvoice(formData);
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert(error.response?.data?.error || 'Failed to create invoice');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await financeAPI.updateInvoiceStatus(id, status);
            fetchData();
        } catch (error) {
            console.error('Error updating invoice:', error);
            alert(error.response?.data?.error || 'Failed to update invoice');
        }
    };

    const resetForm = () => {
        setFormData({
            project_id: '',
            invoice_number: '',
            client_name: '',
            amount: '',
            due_date: '',
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Paid': return 'badge-success';
            case 'Overdue': return 'badge-danger';
            case 'Cancelled': return 'badge-danger';
            default: return 'badge-warning';
        }
    };

    const getAccountTypeColor = (type) => {
        switch (type) {
            case 'Asset': return 'var(--success)';
            case 'Liability': return 'var(--danger)';
            case 'Revenue': return 'var(--primary)';
            case 'Expense': return 'var(--warning)';
            default: return 'var(--info)';
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="finance-page">
                <div className="container">
                    <div className="page-header">
                        <div>
                            <h1>Finance</h1>
                            <p className="text-muted">Manage invoices and track accounts</p>
                        </div>
                        {hasAnyRole('Admin', 'Manager') && activeTab === 'invoices' && (
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <span>➕</span> New Invoice
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
                            onClick={() => setActiveTab('invoices')}
                        >
                            💰 Invoices
                        </button>
                        <button
                            className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('accounts')}
                        >
                            📊 Accounts
                        </button>
                    </div>

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div className="tab-content fade-in">
                            {invoices.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Invoice #</th>
                                                <th>Client</th>
                                                <th>Project</th>
                                                <th>Amount</th>
                                                <th>Due Date</th>
                                                <th>Status</th>
                                                {hasAnyRole('Admin', 'Manager') && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id}>
                                                    <td><strong>{invoice.invoice_number}</strong></td>
                                                    <td>{invoice.client_name}</td>
                                                    <td>{invoice.project_name || 'N/A'}</td>
                                                    <td><strong>${parseFloat(invoice.amount).toLocaleString()}</strong></td>
                                                    <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    {hasAnyRole('Admin', 'Manager') && (
                                                        <td>
                                                            {invoice.status === 'Pending' && (
                                                                <button
                                                                    className="btn-small btn-success"
                                                                    onClick={() => handleStatusUpdate(invoice.id, 'Paid')}
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">💰</div>
                                    <h3>No Invoices Yet</h3>
                                    <p className="text-muted">Create your first invoice to get started</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Accounts Tab */}
                    {activeTab === 'accounts' && (
                        <div className="tab-content fade-in">
                            <div className="accounts-grid">
                                {accounts.map((account) => (
                                    <div key={account.id} className="account-card">
                                        <div className="account-header">
                                            <h3>{account.account_name}</h3>
                                            <span
                                                className="account-type"
                                                style={{
                                                    background: `${getAccountTypeColor(account.account_type)}20`,
                                                    color: getAccountTypeColor(account.account_type),
                                                    border: `1px solid ${getAccountTypeColor(account.account_type)}`,
                                                }}
                                            >
                                                {account.account_type}
                                            </span>
                                        </div>
                                        <div className="account-balance">
                                            ${parseFloat(account.balance).toLocaleString()}
                                        </div>
                                        {account.description && (
                                            <p className="account-description text-muted">{account.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Invoice</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Invoice Number *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.invoice_number}
                                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                    placeholder="INV-001"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Client Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                    placeholder="Client Name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Project (Optional)</label>
                                <select
                                    className="form-select"
                                    value={formData.project_id}
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Amount ($) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Due Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Finance;
