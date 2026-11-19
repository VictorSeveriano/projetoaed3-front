import React from 'react';

const StatCard = ({ icon, label, value, color = 'primary', loading, featured = false }) => (
  <div className={`stat-card stat-card--${color} ${featured ? 'stat-card--featured' : ''}`.trim()}>
    <div className="stat-card__icon" aria-hidden="true">{icon}</div>
    <div className="stat-card__content">
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{loading ? '—' : value}</span>
    </div>
  </div>
);

export default StatCard;
