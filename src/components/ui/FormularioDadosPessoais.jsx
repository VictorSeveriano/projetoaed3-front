import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { useFormularioValidacao } from './FormularioWizard/useFormularioValidacao';
import { EtapaDadosPessoais } from './FormularioWizard/EtapaDadosPessoais';
import { EtapaEndereco } from './FormularioWizard/EtapaEndereco';
import { EtapaSenha } from './FormularioWizard/EtapaSenha';

const FormularioDadosPessoais = ({ form, setForm, error, perfil, etapa = 1, onAvancar, onVoltar, onSubmit, onClearError, loading }) => {
  const {
    fieldErrors, setFieldErrors, cepLoading, verificandoCadastro, setVerificandoCadastro,
    erroVerificacao, setErroVerificacao, getFieldError, handleBlur, handleChange,
    handleCepSearch, getInputClass, renderError, hasDuplicateErrors
  } = useFormularioValidacao({ form, setForm, onClearError });

  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && (
        <div className="login-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <TriangleAlert size={16} /> {error}
        </div>
      )}
      {erroVerificacao && (
        <div className="login-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <TriangleAlert size={16} /> {erroVerificacao}
        </div>
      )}

      {etapa === 1 && (
        <EtapaDadosPessoais 
          form={form} perfil={perfil} 
          verificandoCadastro={verificandoCadastro} hasDuplicateErrors={hasDuplicateErrors}
          getInputClass={getInputClass} handleChange={handleChange} handleBlur={handleBlur}
          renderError={renderError} getFieldError={getFieldError} setFieldErrors={setFieldErrors}
          setErroVerificacao={setErroVerificacao} setVerificandoCadastro={setVerificandoCadastro}
          onAvancar={onAvancar}
        />
      )}

      {etapa === 2 && (
        <EtapaEndereco 
          form={form} 
          getInputClass={getInputClass} handleChange={handleChange} handleBlur={handleBlur}
          renderError={renderError} handleCepSearch={handleCepSearch} cepLoading={cepLoading}
          onVoltar={onVoltar} onAvancar={onAvancar} getFieldError={getFieldError} setFieldErrors={setFieldErrors}
        />
      )}

      {etapa === 3 && (
        <EtapaSenha 
          form={form} 
          getInputClass={getInputClass} handleChange={handleChange} handleBlur={handleBlur}
          renderError={renderError} onVoltar={onVoltar} onSubmit={onSubmit}
          getFieldError={getFieldError} setFieldErrors={setFieldErrors} loading={loading}
        />
      )}
    </form>
  );
};

export default FormularioDadosPessoais;
