import React from 'react';

const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = ({ children, className = '' }) => (
  <div className={`card__header ${className}`}>{children}</div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`card__body ${className}`}>{children}</div>
);

export default Card;
