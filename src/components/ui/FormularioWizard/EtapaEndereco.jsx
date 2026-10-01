import React from 'react';
import { Search } from 'lucide-react';

export const EtapaEndereco = ({ form, getInputClass, handleChange, handleBlur, renderError, handleCepSearch, cepLoading, onVoltar, onAvancar, getFieldError, setFieldErrors }) => {

  const handleAvancar2 = () => {
    let hasError = false;
    const newErrors = {};

    const requiredFields2 = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    requiredFields2.forEach(field => {
      const value = form.endereco?.[field] || '';
      const errorMsg = getFieldError(`endereco.${field}`, value);
      if (errorMsg) {
        newErrors[`endereco.${field}`] = errorMsg;
        hasError = true;
      }
    });

    setFieldErrors(prev => ({ ...prev, ...newErrors }));
    if (!hasError && onAvancar) {
      onAvancar(3);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Etapa 2 de 3</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Endereço</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="input-group">
          <label className="input-label" htmlFor="form-cep">CEP *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              id="form-cep" name="endereco.cep" type="text" 
              className={getInputClass('endereco.cep')} 
              placeholder="00000-000" 
              value={form.endereco?.cep || ''} 
              onChange={handleChange} 
              onBlur={handleBlur}
            />
            <button type="button" className="btn btn-secondary" onClick={handleCepSearch} disabled={cepLoading} style={{ padding: '0 16px' }}>
              {cepLoading ? <span className="btn__spinner" /> : <Search size={18} />}
            </button>
          </div>
          {renderError('endereco.cep')}
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="form-estado">Estado (UF) *</label>
          <input 
            id="form-estado" name="endereco.estado" type="text" 
            className={getInputClass('endereco.estado')} 
            maxLength={2} 
            value={form.endereco?.estado || ''} 
            onChange={handleChange} 
            onBlur={handleBlur}
          />
          {renderError('endereco.estado')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-rua">Rua *</label>
          <input 
            id="form-rua" name="endereco.rua" type="text" 
            className={getInputClass('endereco.rua')} 
            value={form.endereco?.rua || ''} 
            onChange={handleChange} 
            onBlur={handleBlur}
          />
          {renderError('endereco.rua')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-numero">Número *</label>
          <input 
            id="form-numero" name="endereco.numero" type="text" 
            className={getInputClass('endereco.numero')} 
            value={form.endereco?.numero || ''} 
            onChange={handleChange} 
            onBlur={handleBlur}
          />
          {renderError('endereco.numero')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-bairro">Bairro *</label>
          <input 
            id="form-bairro" name="endereco.bairro" type="text" 
            className={getInputClass('endereco.bairro')} 
            value={form.endereco?.bairro || ''} 
            onChange={handleChange} 
            onBlur={handleBlur}
          />
          {renderError('endereco.bairro')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-cidade">Cidade *</label>
          <input 
            id="form-cidade" name="endereco.cidade" type="text" 
            className={getInputClass('endereco.cidade')} 
            value={form.endereco?.cidade || ''} 
            onChange={handleChange} 
            onBlur={handleBlur}
          />
          {renderError('endereco.cidade')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-secondary" onClick={() => onVoltar(1)} style={{ minWidth: '100px' }}>
          ← Voltar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleAvancar2} style={{ minWidth: '120px' }}>
          Avançar →
        </button>
      </div>
    </>
  );
};
