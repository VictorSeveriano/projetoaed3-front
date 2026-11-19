import React from 'react';

const Badge = ({ label, color = 'primary', dot = false, className = '' }) => (
  <span className={`badge badge--${color} ${className}`.trim()}>
    {dot && <span className="badge__dot" aria-hidden="true" />}
    {label}
  </span>
);

export default Badge;
