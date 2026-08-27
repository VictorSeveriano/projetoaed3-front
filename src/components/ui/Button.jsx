import React from 'react';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', ...props
}) => {
  return (
    <button
      className={`btn btn--${size} ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn__spinner" /> : children}
    </button>
  );
};

export default Button;
