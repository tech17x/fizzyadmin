import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: 'blue',
    green: 'green',
    purple: 'purple',
    orange: 'orange'
  };

  return (
    <div className="metric-card">
      <div className="metric-card-content">
        <div className="metric-card-info">
          <p className="metric-card-title">{title}</p>
          <p className="metric-card-value">{value}</p>
          {trend && (
            <div className={`metric-card-trend ${trend.direction}`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="metric-card-trend-icon" />
              ) : (
                <TrendingDown className="metric-card-trend-icon" />
              )}
              <span className="metric-card-trend-text">
                {trend.value}% vs last period
              </span>
            </div>
          )}
        </div>
        <div className={`metric-card-icon ${colorClasses[color]}`}>
          <Icon />
        </div>
      </div>
    </div>
  );
}