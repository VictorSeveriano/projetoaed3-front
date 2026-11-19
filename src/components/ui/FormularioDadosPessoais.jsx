import React from 'react';
import { TriangleAlert, Check } from 'lucide-react';
import { useFormularioValidacao } from './FormularioWizard/useFormularioValidacao';
import { EtapaDadosPessoais } from './FormularioWizard/EtapaDadosPessoais';
import { EtapaEndereco } from './FormularioWizard/EtapaEndereco';
import { EtapaSenha } from './FormularioWizard/EtapaSenha';

const ETAPAS = [
  { num: 1, label: 'Dados pessoais' },
  { num: 2, label: 'Endereço' },
  { num: 3, label: 'Segurança' },
];

const FormularioDadosPessoais = ({
  form, setForm, error, perfil, etapa = 1, onAvancar, onVoltar, onSubmit, onClearError, loading,
}) => {
  const {
    setFieldErrors, cepLoading, verificandoCadastro, setVerificandoCadastro,
    erroVerificacao, setErroVerificacao, getFieldError, handleBlur, handleChange,
    handleCepSearch, getInputClass, renderError, hasDuplicateErrors,
  } = useFormularioValidacao({ form, setForm, onClearError });

  return (
    <form className="wizard-form" onSubmit={(e) => e.preventDefault()} noValidate>
      <ol className="wizard-stepper" aria-label="Etapas do cadastro">
        {ETAPAS.map((item) => {
          const concluida = etapa > item.num;
          const ativa = etapa === item.num;
          return (
            <li
              key={item.num}
              className={`wizard-step ${ativa ? 'wizard-step--active' : ''} ${concluida ? 'wizard-step--done' : ''}`.trim()}
              aria-current={ativa ? 'step' : undefined}
            >
              <span className="wizard-step__num" aria-hidden="true">
                {concluida ? <Check size={12} /> : item.num}
              </span>
              <span className="wizard-step__label">{item.label}</span>
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="login-error" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {erroVerificacao && (
        <div className="login-error" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>{erroVerificacao}</span>
        </div>
      )}

      {etapa === 1 && (
        <EtapaDadosPessoais
          form={form}
          perfil={perfil}
          verificandoCadastro={verificandoCadastro}
          hasDuplicateErrors={hasDuplicateErrors}
          getInputClass={getInputClass}
          handleChange={handleChange}
          handleBlur={handleBlur}
          renderError={renderError}
          getFieldError={getFieldError}
          setFieldErrors={setFieldErrors}
          setErroVerificacao={setErroVerificacao}
          setVerificandoCadastro={setVerificandoCadastro}
          onAvancar={onAvancar}
        />
      )}

      {etapa === 2 && (
        <EtapaEndereco
          form={form}
          getInputClass={getInputClass}
          handleChange={handleChange}
          handleBlur={handleBlur}
          renderError={renderError}
          handleCepSearch={handleCepSearch}
          cepLoading={cepLoading}
          onVoltar={onVoltar}
          onAvancar={onAvancar}
          getFieldError={getFieldError}
          setFieldErrors={setFieldErrors}
        />
      )}

      {etapa === 3 && (
        <EtapaSenha
          form={form}
          getInputClass={getInputClass}
          handleChange={handleChange}
          handleBlur={handleBlur}
          renderError={renderError}
          onVoltar={onVoltar}
          onSubmit={onSubmit}
          getFieldError={getFieldError}
          setFieldErrors={setFieldErrors}
          loading={loading}
        />
      )}
    </form>
  );
};

export default FormularioDadosPessoais;
