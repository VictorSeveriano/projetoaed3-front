import React from 'react';
import authService from '../../../services/auth.service';

export const EtapaDadosPessoais = ({ form, perfil, verificandoCadastro, hasDuplicateErrors, getInputClass, handleChange, handleBlur, renderError, handleAvancar, getFieldError, setFieldErrors, setErroVerificacao, setVerificandoCadastro, onAvancar }) => {
  
  const handleAvancarWrapper = async () => {
    let hasError = false;
    const newErrors = {};

    const requiredFields1 = ['nome', 'cpf', 'celular', 'email'];
    if (perfil === 'MOTORISTA') requiredFields1.push('cnh');

    requiredFields1.forEach(field => {
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
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Etapa 1 de 3</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dados pessoais</p>
      </div>
      <fieldset disabled={verificandoCadastro} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <div className="input-group">
          <label className="input-label" htmlFor="form-nome">Nome Completo *</label>
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
          <label className="input-label" htmlFor="form-cpf">CPF *</label>
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
            <label className="input-label" htmlFor="form-cnh">CNH *</label>
            <input 
              id="form-cnh" name="cnh" type="text" 
              className={getInputClass('cnh')} 
              placeholder="Número da CNH" 
              value={form.cnh || ''} 
              onChange={handleChange} 
              onBlur={handleBlur}
            />
            {renderError('cnh')}
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="form-celular">Celular *</label>
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
          <label className="input-label" htmlFor="form-email">E-mail *</label>
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
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-primary" onClick={handleAvancarWrapper} disabled={verificandoCadastro || hasDuplicateErrors} style={{ minWidth: '120px' }}>
            {verificandoCadastro ? 'Verificando dados...' : 'Avançar →'}
          </button>
      </div>
    </>
  );
};
