import React from 'react';
import Button from '../Button';

export const EtapaSenha = ({
  form, getInputClass, handleChange, handleBlur, renderError,
  onVoltar, onSubmit, getFieldError, setFieldErrors, loading,
}) => {
  const handleFinalizar = () => {
    let hasError = false;
    const newErrors = {};

    const requiredFields3 = ['senha', 'senhaConfirmacao'];
    requiredFields3.forEach((field) => {
      const value = form[field] || '';
      const errorMsg = getFieldError(field, value);
      if (errorMsg) {
        newErrors[field] = errorMsg;
        hasError = true;
      }
    });

    setFieldErrors((prev) => ({ ...prev, ...newErrors }));
    if (!hasError && onSubmit) {
      onSubmit();
    }
  };

  return (
    <>
      <div className="wizard-header">
        <h3 className="wizard-header__title">Etapa 3 de 3 — Segurança</h3>
        <p className="wizard-header__desc">Crie uma senha forte para proteger sua conta.</p>
      </div>
      <div className="form-grid">
        <div className="input-group">
          <label className="input-label" htmlFor="form-senha">
            Senha <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-senha" name="senha" type="password"
            className={getInputClass('senha')}
            placeholder="Crie sua senha"
            value={form.senha || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('senha')}
          <div className="password-rules">
            <p className="password-rules__title">Requisitos da senha:</p>
            <ul className="password-rules__list">
              <li>No mínimo 8 caracteres</li>
              <li>Pelo menos um número</li>
              <li>Pelo menos um caractere especial (!@#$%&amp;*)</li>
              <li>Evite sequências ou repetições, como 123456789</li>
              <li>Não utilize seu nome ou sobrenome</li>
            </ul>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-senhaConfirmacao">
            Confirme a Senha <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-senhaConfirmacao" name="senhaConfirmacao" type="password"
            className={getInputClass('senhaConfirmacao')}
            placeholder="Repita a senha"
            value={form.senhaConfirmacao || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('senhaConfirmacao')}
        </div>
      </div>

      <div className="form-actions form-actions--between">
        <Button type="button" variant="outline" onClick={() => onVoltar(2)} disabled={loading}>
          ← Voltar
        </Button>
        <Button type="button" variant="primary" onClick={handleFinalizar} loading={loading}>
          Finalizar cadastro
        </Button>
      </div>
    </>
  );
};
