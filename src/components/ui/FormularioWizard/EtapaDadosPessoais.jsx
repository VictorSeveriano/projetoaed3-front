import React from 'react';
import authService from '../../../services/auth.service';
import Button from '../Button';

export const EtapaDadosPessoais = ({
  form, perfil, verificandoCadastro, hasDuplicateErrors,
  getInputClass, handleChange, handleBlur, renderError,
  getFieldError, setFieldErrors, setErroVerificacao, setVerificandoCadastro, onAvancar,
}) => {
  const handleAvancarWrapper = async () => {
    let hasError = false;
    const newErrors = {};

    const requiredFields1 = ['nome', 'cpf', 'celular', 'email'];
    if (perfil === 'MOTORISTA') requiredFields1.push('cnh');

    requiredFields1.forEach((field) => {
      const value = form[field] || '';
      const errorMsg = getFieldError(field, value);
      if (errorMsg) {
        newErrors[field] = errorMsg;
        hasError = true;
      }
    });

    setFieldErrors(newErrors);
    setErroVerificacao('');
    if (hasError || !onAvancar || verificandoCadastro) return;

    setVerificandoCadastro(true);
    try {
      const { duplicados } = await authService.verificarDisponibilidadeCadastro({
        cpf: form.cpf,
        email: form.email,
        perfil,
        cnh: perfil === 'MOTORISTA' ? form.cnh : undefined,
      });
      const errosDuplicidade = {};
      if (duplicados.cpf) errosDuplicidade.cpf = 'CPF já cadastrado no sistema.';
      if (duplicados.email) errosDuplicidade.email = 'E-mail já cadastrado no sistema.';
      if (duplicados.cnh) errosDuplicidade.cnh = 'CNH já cadastrada no sistema.';

      if (Object.keys(errosDuplicidade).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errosDuplicidade }));
        return;
      }

      onAvancar(2);
    } catch (err) {
      setErroVerificacao(err.response?.data?.message || 'Não foi possível verificar os dados. Tente novamente.');
    } finally {
      setVerificandoCadastro(false);
    }
  };

  return (
    <>
      <div className="wizard-header">
        <h3 className="wizard-header__title">Etapa 1 de 3 — Dados pessoais</h3>
        <p className="wizard-header__desc">Campos marcados com * são obrigatórios.</p>
      </div>
      <fieldset disabled={verificandoCadastro} className="form-grid">
        <div className="input-group">
          <label className="input-label" htmlFor="form-nome">
            Nome Completo <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-nome" name="nome" type="text"
            className={getInputClass('nome')}
            placeholder="Seu nome completo"
            value={form.nome || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('nome')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-cpf">
            CPF <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-cpf" name="cpf" type="text"
            className={getInputClass('cpf')}
            placeholder="000.000.000-00"
            value={form.cpf || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('cpf')}
        </div>

        {perfil === 'MOTORISTA' && (
          <div className="input-group">
            <label className="input-label" htmlFor="form-cnh">
              CNH <span className="input-required" aria-hidden="true">*</span>
            </label>
            <input
              id="form-cnh" name="cnh" type="text"
              className={getInputClass('cnh')}
              placeholder="11 dígitos numéricos"
              value={form.cnh || ''}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {renderError('cnh')}
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="form-celular">
            Celular <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-celular" name="celular" type="text"
            className={getInputClass('celular')}
            placeholder="(00) 00000-0000"
            value={form.celular || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('celular')}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="form-email">
            E-mail <span className="input-required" aria-hidden="true">*</span>
          </label>
          <input
            id="form-email" name="email" type="email"
            className={getInputClass('email')}
            placeholder="seu@email.com"
            value={form.email || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {renderError('email')}
        </div>
      </fieldset>

      <div className="form-actions">
        <Button
          type="button"
          variant="primary"
          onClick={handleAvancarWrapper}
          disabled={verificandoCadastro || hasDuplicateErrors}
          loading={verificandoCadastro}
        >
          Avançar →
        </Button>
      </div>
    </>
  );
};
