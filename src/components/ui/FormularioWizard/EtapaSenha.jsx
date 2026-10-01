import React from 'react';

export const EtapaSenha = ({ form, getInputClass, handleChange, handleBlur, renderError, onVoltar, onSubmit, getFieldError, setFieldErrors, loading }) => {

  const handleFinalizar = () => {
    let hasError = false;
    const newErrors = {};

    const requiredFields3 = ['senha', 'senhaConfirmacao'];
    requiredFields3.forEach(field => {
      const value = form[field] || '';
      const errorMsg = getFieldError(field, value);
      if (errorMsg) {
        newErrors[field] = errorMsg;
        hasError = true;
      }
    });

    setFieldErrors(prev => ({ ...prev, ...newErrors }));
    if (!hasError && onSubmit) {
      onSubmit();
    }
  };

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Etapa 3 de 3</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Segurança</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="input-group">
          <label className="input-label" htmlFor="form-senha">Senha *</label>
          <input 
            id="form-senha" name="senha" type="password" 
            className={getInputClass('senha')} 
            placeholder="••••••••" 
            value={form.senha || ''} 
            onChange={handleChange} 
            onBlur={handleBlur}
          />
          {renderError('senha')}
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>Requisitos da senha:</p>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
              <li>No mínimo 8 caracteres</li>
              <li>Pelo menos um número</li>
              <li>Pelo menos um caractere especial (!@#$%&*)</li>
              <li>Evite sequências ou repetições, como 123456789</li>
              <li>Não utilize seu nome ou sobrenome</li>
            </ul>
          </div>
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="form-senhaConfirmacao">Confirme a Senha *</label>
          <input 
            id="form-senhaConfirmacao" name="senhaConfirmacao" type="password" 
            className={getInputClass('senhaConfirmacao')} 
            placeholder="••••••••" 
            value={form.senhaConfirmacao || ''} 
            onChange={handleChange} 
            onBlur={handleBlur}
          />
          {renderError('senhaConfirmacao')}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-secondary" onClick={() => onVoltar(2)} style={{ minWidth: '100px' }}>
          ← Voltar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleFinalizar} disabled={loading} style={{ minWidth: '160px' }}>
          {loading ? <span className="btn__spinner" /> : 'Finalizar cadastro'}
        </button>
      </div>
    </>
  );
};
