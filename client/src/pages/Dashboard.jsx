import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { insightsAPI, financeAPI } from '../services/api';
import './Dashboard.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, accountsRes] = await Promise.all([
                insightsAPI.getDashboardStats(),
                financeAPI.getAccounts(),
            ]);

            setStats(statsRes.data);
            setAccounts(accountsRes.data.accounts);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
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

    const getRiskColor = (level) => {
        switch (level) {
            case 'Critical': return '#ef4444';
            case 'High': return '#f59e0b';
            case 'Medium': return '#3b82f6';
            default: return '#10b981';
        }
    };

    const riskChartData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [
            {
                data: [
                    stats?.risk?.riskLevel === 'Low' ? 100 : 0,
                    stats?.risk?.riskLevel === 'Medium' ? 100 : 0,
                    stats?.risk?.riskLevel === 'High' || stats?.risk?.riskLevel === 'Critical' ? 100 : 0,
                ],
                backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                borderColor: ['#059669', '#2563eb', '#dc2626'],
                borderWidth: 2,
            },
        ],
    };

    const accountsData = {
        labels: accounts.slice(0, 6).map(acc => acc.account_name),
        datasets: [
            {
                label: 'Account Balance ($)',
                data: accounts.slice(0, 6).map(acc => parseFloat(acc.balance)),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                ],
                borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(236, 72, 153)',
                    'rgb(20, 184, 166)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(59, 130, 246)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#cbd5e1',
                    font: { size: 12 },
                },
            },
        },
        scales: {
            y: {
                ticks: { color: '#cbd5e1' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            x: {
                ticks: { color: '#cbd5e1' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
        },
    };

    return (
        <>
            <Navbar />
            <div className="dashboard-page">
                <div className="container">
                    <div className="page-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p className="text-muted">Overview of your construction projects and finances</p>
                        </div>
                        <Link to="/projects" className="btn btn-primary">
                            <span>➕</span> New Project
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-4 fade-in">
                        <StatCard
                            title="Total Projects"
                            value={stats?.projects?.total || 0}
                            icon="🏗️"
                            color="primary"
                        />
                        <StatCard
                            title="Active Projects"
                            value={stats?.projects?.active || 0}
                            icon="⚡"
                            color="success"
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`$${(stats?.finance?.totalRevenue || 0).toLocaleString()}`}
                            icon="💰"
                            color="info"
                        />
                        <StatCard
                            title="Outstanding"
                            value={`$${(stats?.finance?.outstandingRevenue || 0).toLocaleString()}`}
                            icon="📊"
                            color="warning"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-2 mt-4">
                        <div className="card chart-card fade-in">
                            <h3>Project Risk Level</h3>
                            <div className="chart-container">
                                <Doughnut data={riskChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } } }} />
                            </div>
                            <div className="risk-info">
                                <div className="risk-badge" style={{ background: `${getRiskColor(stats?.risk?.riskLevel)}20`, border: `2px solid ${getRiskColor(stats?.risk?.riskLevel)}`, color: getRiskColor(stats?.risk?.riskLevel) }}>
                                    {stats?.risk?.riskLevel || 'Low'} Risk
                                </div>
                                <p className="text-muted">Average Risk Score: {stats?.risk?.averageRiskScore || 0}</p>
                            </div>
                        </div>

                        <div className="card chart-card fade-in">
                            <h3>Account Balances</h3>
                            <div className="chart-container">
                                <Bar data={accountsData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Project Summary */}
                    <div className="card mt-4 fade-in">
                        <div className="flex-between mb-3">
                            <h3>Project Summary</h3>
                            <Link to="/projects" className="btn btn-outline">View All</Link>
                        </div>
                        <div className="grid grid-3">
                            <div className="summary-item">
                                <div className="summary-label">Total Budget</div>
                                <div className="summary-value">${(stats?.projects?.totalBudget || 0).toLocaleString()}</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Total Spent</div>
                                <div className="summary-value">${(stats?.projects?.totalSpent || 0).toLocaleString()}</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Avg Progress</div>
                                <div className="summary-value">{(stats?.projects?.avgProgress || 0).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="card mt-4 fade-in">
                        <div className="flex-between mb-3">
                            <h3>Recent Transactions</h3>
                            <Link to="/finance" className="btn btn-outline">View All</Link>
                        </div>
                        {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                            <div className="transactions-list">
                                {stats.recentTransactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction.id} className="transaction-item">
                                        <div className="transaction-info">
                                            <span className="transaction-account">{transaction.account_name}</span>
                                            <span className="transaction-desc text-muted">{transaction.description}</span>
                                        </div>
                                        <div className="transaction-amount">
                                            <span className={transaction.transaction_type === 'Debit' ? 'text-success' : 'text-danger'}>
                                                {transaction.transaction_type === 'Debit' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
                                            </span>
                                            <span className="badge badge-info">{transaction.transaction_type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted text-center">No recent transactions</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
