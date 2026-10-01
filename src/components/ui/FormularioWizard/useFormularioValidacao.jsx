import { useState } from 'react';
import axios from 'axios';
import authService from '../../../services/auth.service';
import { formatarCPF, formatarCelular, formatarCEP } from '../../../utils/formatters';
import { validarCPF, validarCelular, validarCEP, validarSenha, validarCNH } from '../../../utils/validators';
import { TriangleAlert } from 'lucide-react';
import React from 'react';

export const useFormularioValidacao = ({ form, setForm, onClearError }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [cepLoading, setCepLoading] = useState(false);
  const [verificandoCadastro, setVerificandoCadastro] = useState(false);
  const [erroVerificacao, setErroVerificacao] = useState('');

  const getFieldError = (name, value) => {
    if (typeof value === 'string' && !value.trim()) return 'Campo obrigatório.';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    onClearError?.();
    
    let formattedValue = value;
    if (name === 'cpf') {
      const limpo = value.replace(/\D/g, '').slice(0, 11);
      formattedValue = formatarCPF(limpo);
    } else if (name === 'celular') {
      const limpo = value.replace(/\D/g, '').slice(0, 11);
      formattedValue = formatarCelular(limpo);
    } else if (name === 'endereco.cep') {
      const limpo = value.replace(/\D/g, '').slice(0, 8);
      formattedValue = formatarCEP(limpo);
    } else if (name === 'cnh') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
    }

    if (name.startsWith('endereco.')) {
      const endField = name.split('.')[1];
      setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [endField]: formattedValue } }));
    } else {
      setForm(prev => ({ ...prev, [name]: formattedValue }));
    }

    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setErroVerificacao('');
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

  const getInputClass = (name) => `input-field ${fieldErrors[name] ? 'input-field--error' : ''}`;

  const renderError = (name) => {
    if (!fieldErrors[name]) return null;
    return (
      <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <TriangleAlert size={14} /> {fieldErrors[name]}
      </div>
    );
  };

  const hasDuplicateErrors = ['cpf', 'email', 'cnh'].some((field) =>
    fieldErrors[field]?.includes('já cadastrado no sistema.')
  );

  return {
    fieldErrors,
    setFieldErrors,
    cepLoading,
    verificandoCadastro,
    setVerificandoCadastro,
    erroVerificacao,
    setErroVerificacao,
    getFieldError,
    handleBlur,
    handleChange,
    handleCepSearch,
    getInputClass,
    renderError,
    hasDuplicateErrors
  };
};
