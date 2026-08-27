import React from 'react';

const Select = ({ label, id, error, children, className = '', ...props }) => (
  <div className={`input-group ${className}`}>
    {label && <label className="input-label" htmlFor={id}>{label}</label>}
    <select id={id} className={`input-field input-field--select ${error ? 'input-field--error' : ''}`} {...props}>
      {children}
    </select>
    {error && <span className="input-error">{error}</span>}
  </div>
);

export default Select;
