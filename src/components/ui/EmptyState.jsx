import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon = <Inbox size={48} strokeWidth={1.5} />, title, description, action }) => (
  <div className="empty-state">
    <span className="empty-state__icon">{icon}</span>
    <h3 className="empty-state__title">{title}</h3>
    {description && <p className="empty-state__description">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
