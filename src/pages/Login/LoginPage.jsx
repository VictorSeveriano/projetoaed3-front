import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CarFront, TriangleAlert } from 'lucide-react';
import FormularioDadosPessoais from '../../components/ui/FormularioDadosPessoais';
import Modal from '../../components/ui/Modal';
import { validarCPF, validarCelular, validarCEP } from '../../utils/validators';

const LoginPage = () => {
  const [form, setForm] = useState({ 
    nome: '', usuario: '', senha: '', perfil: 'USUARIO', 
    cpf: '', celular: '', email: '', 
    endereco: { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' },
    cnh: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);
  
  // Controle do modal de cadastro
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('ESCOLHA'); // 'ESCOLHA', 1, 2
  
  const { login, cadastrar } = useAuth();
  const navigate = useNavigate();

  const resetCadastro = () => {
    setForm({ 
      nome: '', usuario: '', senha: '', perfil: 'USUARIO', 
      cpf: '', celular: '', email: '', 
      endereco: { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' },
      cnh: ''
    });
    setError('');
    setModalStep('ESCOLHA');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetCadastro();
  };

  const handleAvancar = (nextStep) => {
    setModalStep(nextStep);
  };

  const handleVoltar = (prevStep) => {
    setModalStep(prevStep);
  };

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.usuario || !form.senha) {
      setError('Preencha usuario e senha.');
      return;
    }
    setLoading(true);
    try {
      const userData = await login(form.usuario, form.senha);
      // Redireciona baseado no perfil do usuário autenticado
      switch (userData?.perfil) {
        case 'MOTORISTA': navigate('/inicio'); break;
        case 'USUARIO':   navigate('/solicitar-corrida'); break;
        default:          navigate('/dashboard'); break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCadastroSubmit = async () => {
    setError('');
    // Frontend validation is now handled inside FormularioDadosPessoais
    // We only need to check profile for CNH
    if (form.perfil === 'MOTORISTA' && !form.cnh) {
      setError('CNH é obrigatória para motoristas.');
      return;
    }

    setLoading(true);
    try {
      const userData = await cadastrar(form);
      setRegisteredUser(userData);
      setModalStep('SUCESSO');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Background animado */}
      <div className="login-bg">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
      </div>

      <div className="login-card animate-fade-in">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo__icon"><CarFront size={48} aria-hidden="true" /></span>
          <h1 className="login-logo__title">ReservaCar</h1>
          <p className="login-logo__subtitle">Sistema de Reservas | AED3</p>
        </div>

        {/* Formulario Login */}
        <form className="login-form" onSubmit={handleLoginSubmit} noValidate>
          <div className="input-group">
            <label className="input-label" htmlFor="login-usuario">Usuário</label>
            <input
              id="login-usuario"
              name="usuario"
              type="text"
              className="input-field"
              placeholder="admin"
              value={form.usuario}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              name="senha"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.senha}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="login-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TriangleAlert size={16} /> {error}
            </div>
          )}

          <button
            id="btn-entrar"
            type="submit"
            className="btn btn--lg btn-primary w-full"
            disabled={loading}
          >
            {loading ? <span className="btn__spinner" /> : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button 
            type="button" 
            className="btn btn-ghost" 
            onClick={() => setModalOpen(true)}
          >
            Não tem uma conta? Cadastre-se
          </button>
        </div>

        <p className="login-hint">
          Credenciais padrão: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>

      {/* MODAL DE CADASTRO */}
      <Modal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        size={modalStep === 'ESCOLHA' || modalStep === 'SUCESSO' ? 'md' : 'lg'}
        title={
          modalStep === 'SUCESSO' 
            ? 'Cadastro Concluído!' 
            : modalStep === 'ESCOLHA' 
              ? 'Criar uma conta' 
              : `Cadastro de ${form.perfil === 'MOTORISTA' ? 'Motorista' : 'Passageiro'}`
        }
      >
        {modalStep === 'ESCOLHA' ? (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Como você deseja entrar?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary btn--lg" 
                onClick={() => {
                  setForm(prev => ({ ...prev, perfil: 'USUARIO' }));
                  setModalStep(1);
                }}
              >
                Passageiro
              </button>
              <button 
                className="btn btn-secondary btn--lg" 
                onClick={() => {
                  setForm(prev => ({ ...prev, perfil: 'MOTORISTA' }));
                  setModalStep(1);
                }}
              >
                Motorista
              </button>
            </div>
            <button className="btn btn-ghost" style={{ marginTop: '24px' }} onClick={handleCloseModal}>
              Fechar
            </button>
          </div>
        ) : modalStep === 'SUCESSO' ? (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ color: 'var(--color-success)', marginBottom: '16px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Obrigado por usar o ReservaCar!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              Seu cadastro foi realizado com sucesso. Para acessar a plataforma, utilize o login gerado abaixo.
            </p>
            <div style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-active)' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SEU LOGIN DE ACESSO</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--color-primary-light)', letterSpacing: '1px' }}>{registeredUser?.usuario}</strong>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
              <TriangleAlert size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              A sua senha de acesso é a mesma que você acabou de criar na etapa anterior.
            </p>
            <button className="btn btn-primary btn--lg w-full" onClick={() => { handleCloseModal(); navigate('/login'); }}>
              Ir para o Login →
            </button>
          </div>
        ) : (
          <FormularioDadosPessoais 
            form={form} 
            setForm={setForm} 
            error={error}
            perfil={form.perfil}
            etapa={modalStep}
            onAvancar={handleAvancar}
            onVoltar={handleVoltar}
            onSubmit={handleCadastroSubmit}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
