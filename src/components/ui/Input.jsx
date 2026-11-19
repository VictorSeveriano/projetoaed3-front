import React, { useId } from 'react';
import { TriangleAlert } from 'lucide-react';

const Input = ({
  label,
  id,
  error,
  hint,
  required = false,
  className = '',
  ...props
}) => {
  const autoId = useId();
  const inputId = id || `input-${autoId.replace(/:/g, '')}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`input-group ${className}`.trim()}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'input-field--error' : ''}`.trim()}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error && (
        <span id={hintId} className="input-hint">{hint}</span>
      )}
      {error && (
        <span id={errorId} className="input-error" role="alert">
          <TriangleAlert size={13} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
