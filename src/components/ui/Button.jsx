import React from 'react';

const VARIANTS = {
  primary: 'btn-primary',
  success: 'btn-success',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn btn--${size} ${VARIANTS[variant] || VARIANTS.primary} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          <span className="sr-only">Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
