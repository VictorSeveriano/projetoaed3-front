import React from 'react';

const StatCard = ({ icon, label, value, color = 'primary', loading }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__content">
      <span className="stat-card__value">{loading ? '...' : value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  </div>
);

export default StatCard;
