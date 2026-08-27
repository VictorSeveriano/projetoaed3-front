import React from 'react';

const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="empty-state">
    <span className="empty-state__icon">{icon}</span>
    <h3 className="empty-state__title">{title}</h3>
    {description && <p className="empty-state__description">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
