import React from 'react';
import { Search } from 'lucide-react';
import Button from '../Button';

export const EtapaEndereco = ({
  form, getInputClass, handleChange, handleBlur, renderError,
  handleCepSearch, cepLoading, onVoltar, onAvancar, getFieldError, setFieldErrors,
}) => {
  const handleAvancar2 = () => {
    let hasError = false;
    const newErrors = {};

    const requiredFields2 = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
    requiredFields2.forEach((field) => {
      const value = form.endereco?.[field] || '';
      const errorMsg = getFieldError(`endereco.${field}`, value);
      if (errorMsg) {
        newErrors[`endereco.${field}`] = errorMsg;
        hasError = true;
      }
    });

    setFieldErrors((prev) => ({ ...prev, ...newErrors }));
    if (!hasError && onAvancar) {
      onAvancar(3);
    }
  };

  return (
    <>
      <div className="wizard-header">
        <h3 className="wizard-header__title">Etapa 2 de 3 — Endereço</h3>
        <p className="wizard-header__desc">Informe o CEP para preencher automaticamente ou digite os campos.</p>
      </div>
      <div className="form-grid">
        <div className="input-group">
          <label className="input-label" htmlFor="form-cep">
            CEP <span className="input-required" aria-hidden="true">*</span>
          </label>
          <div className="wizard-cep-row">
            <input
              id="form-cep" name="endereco.cep" type="text"
              className={getInputClass('endereco.cep')}
              placeholder="00000-000"
              value={form.endereco?.cep || ''}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleCepSearch}
              loading={cepLoading}
              aria-label="Buscar endereço pelo CEP"
              title="Buscar CEP"
            >
              <Search size={16} aria-hidden="true" />
            </Button>
          </div>
          {renderError('endereco.cep')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-estado">
            Estado (UF) <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-estado" name="endereco.estado" type="text"
            className={getInputClass('endereco.estado')}
            placeholder="Ex: ES"
            maxLength={2}
            value={form.endereco?.estado || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('endereco.estado')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-rua">
            Rua <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-rua" name="endereco.rua" type="text"
            className={getInputClass('endereco.rua')}
            placeholder="Nome da rua ou avenida"
            value={form.endereco?.rua || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('endereco.rua')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-numero">
            Número <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-numero" name="endereco.numero" type="text"
            className={getInputClass('endereco.numero')}
            placeholder="Ex: 120"
            value={form.endereco?.numero || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('endereco.numero')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-bairro">
            Bairro <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-bairro" name="endereco.bairro" type="text"
            className={getInputClass('endereco.bairro')}
            placeholder="Nome do bairro"
            value={form.endereco?.bairro || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('endereco.bairro')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-cidade">
            Cidade <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-cidade" name="endereco.cidade" type="text"
            className={getInputClass('endereco.cidade')}
            placeholder="Nome da cidade"
            value={form.endereco?.cidade || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('endereco.cidade')}
        </div>
      </div>

      <div className="form-actions form-actions--between">
        <Button type="button" variant="outline" onClick={() => onVoltar(1)}>
          ← Voltar
        </Button>
        <Button type="button" variant="primary" onClick={handleAvancar2}>
          Avançar →
        </Button>
      </div>
    </>
  );
};
