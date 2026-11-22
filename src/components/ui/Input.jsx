import React, { useId, useState } from 'react';
import { TriangleAlert, Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  id,
  error,
  hint,
  required = false,
  className = '',
  type = 'text',
  showPasswordToggle = false,
  ...props
}) => {
  const autoId = useId();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const inputId = id || `input-${autoId.replace(/:/g, '')}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
  ].filter(Boolean).join(' ') || undefined;

  const temToggleSenha = showPasswordToggle && type === 'password';
  const tipoEfetivo = temToggleSenha && mostrarSenha ? 'text' : type;

  const campoInput = (
    <input
      id={inputId}
      type={tipoEfetivo}
      className={`input-field ${error ? 'input-field--error' : ''} ${temToggleSenha ? 'input-field--with-toggle' : ''}`.trim()}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...props}
    />
  );

  return (
    <div className={`input-group ${className}`.trim()}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      {temToggleSenha ? (
        <div className="input-password-wrap">
          {campoInput}
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setMostrarSenha((prev) => !prev)}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={mostrarSenha}
            title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
      ) : (
        campoInput
      )}
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
