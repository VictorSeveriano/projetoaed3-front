import React from 'react';

const Badge = ({ label, color = 'primary' }) => (
  <span className={`badge badge--${color}`}>{label}</span>
);

export default Badge;
