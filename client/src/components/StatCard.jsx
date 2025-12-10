import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, trend, color = 'primary' }) => {
    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <h3 className="stat-title">{title}</h3>
                <div className="stat-value">{value}</div>
                {trend && (
                    <div className={`stat-trend ${trend.direction}`}>
                        <span className="trend-icon">
                            {trend.direction === 'up' ? '↑' : '↓'}
                        </span>
                        <span className="trend-value">{trend.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
