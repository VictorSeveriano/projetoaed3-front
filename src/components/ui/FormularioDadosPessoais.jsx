import React, { useState } from 'react';
import { TriangleAlert, Search } from 'lucide-react';
import axios from 'axios';
import { formatarCPF, formatarCelular, formatarCEP } from '../../utils/formatters';
import { validarCPF, validarCelular, validarCEP, validarSenha, validarCNH } from '../../utils/validators';

const FormularioDadosPessoais = ({ form, setForm, error, perfil, etapa = 1, onAvancar, onVoltar, onSubmit, loading }) => {
  const [cepLoading, setCepLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const getFieldError = (name, value) => {
    if (!value && typeof value === 'string' && !value.trim()) {
      return 'Campo obrigatório.';
    }

    if (name === 'cpf') {
      const limpo = value.replace(/\D/g, '');
      if (limpo.length !== 11) return 'CPF deve possuir 11 números.';
      if (!validarCPF(limpo)) return 'CPF inválido.';
    } else if (name === 'celular') {
      if (!validarCelular(value)) return 'Celular inválido.';
    } else if (name === 'endereco.cep') {
      if (!validarCEP(value)) return 'CEP deve possuir 8 números.';
    } else if (name === 'cnh') {
      const limpo = value.replace(/\D/g, '');
      if (limpo.length !== 11) return 'CNH deve possuir 11 números.';
      if (!validarCNH(limpo)) return 'CNH inválida.';
    } else if (name === 'email') {
      if (!value.includes('@') || !value.includes('.')) return 'E-mail inválido.';
    } else if (name === 'senha') {
      const senhaErro = validarSenha(value, form.nome);
      if (senhaErro) return senhaErro;
    } else if (name === 'senhaConfirmacao') {
      if (value !== form.senha) return 'As senhas não coincidem.';
    }

    return '';
  };

  const validateField = (name, value) => {
    const errorMsg = getFieldError(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleCepSearch = async () => {
    const cep = form.endereco?.cep?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
      setFieldErrors(prev => ({ ...prev, 'endereco.cep': 'CEP deve possuir 8 números.' }));
      return;
    }
    setCepLoading(true);
    setFieldErrors(prev => ({ ...prev, 'endereco.cep': '' }));
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) {
        setFieldErrors(prev => ({ ...prev, 'endereco.cep': 'CEP inválido.' }));
      } else {
        setForm(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          }
        }));
      }
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, 'endereco.cep': 'Erro ao consultar CEP.' }));
    } finally {
      setCepLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatting and preventing non-numeric inputs for numeric fields
    let formattedValue = value;
    if (name === 'cpf') {
      // Limita a 11 digitos numericos, depois formata
      const limpo = value.replace(/\D/g, '').slice(0, 11);
      formattedValue = formatarCPF(limpo);
    } else if (name === 'celular') {
      const limpo = value.replace(/\D/g, '').slice(0, 11);
      formattedValue = formatarCelular(limpo);
    } else if (name === 'endereco.cep') {
      const limpo = value.replace(/\D/g, '').slice(0, 8);
      formattedValue = formatarCEP(limpo);
    } else if (name === 'cnh') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11); // CNH only numbers max 11
    }

    if (name.startsWith('endereco.')) {
      const endField = name.split('.')[1];
      setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [endField]: formattedValue } }));
    } else {
      setForm(prev => ({ ...prev, [name]: formattedValue }));
    }

    // Clear error on change to improve UX
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getInputClass = (name) => {
    return `input-field ${fieldErrors[name] ? 'input-field--error' : ''}`;
  };

  const renderError = (name) => {
    if (!fieldErrors[name]) return null;
    return (
      <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <TriangleAlert size={14} /> {fieldErrors[name]}
      </div>
    );
  };

  const handleAvancar = () => {
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
    if (!hasError && onAvancar) {
      onAvancar(2);
    }
  };

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
    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && (
        <div className="login-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <TriangleAlert size={16} /> {error}
        </div>
      )}

      {etapa === 1 && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Etapa 1 de 3</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dados pessoais</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
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

          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
             <button type="button" className="btn btn-primary" onClick={handleAvancar} style={{ minWidth: '120px' }}>
               Avançar →
             </button>
          </div>
        </>
      )}

      {etapa === 2 && (
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
      )}

      {etapa === 3 && (
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
      )}
    </form>
  );
};

export default FormularioDadosPessoais;
