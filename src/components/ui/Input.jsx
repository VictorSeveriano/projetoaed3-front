import React from 'react';

const Input = ({ label, id, error, className = '', ...props }) => (
  <div className={`input-group ${className}`}>
    {label && <label className="input-label" htmlFor={id}>{label}</label>}
    <input id={id} className={`input-field ${error ? 'input-field--error' : ''}`} {...props} />
    {error && <span className="input-error">{error}</span>}
  </div>
);

export default Input;
