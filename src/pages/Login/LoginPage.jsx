import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CarFront, TriangleAlert, CheckCircle2, User, Car } from 'lucide-react';
import FormularioDadosPessoais from '../../components/ui/FormularioDadosPessoais';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage = () => {
  const [form, setForm] = useState({
    nome: '', usuario: '', senha: '', perfil: 'USUARIO',
    cpf: '', celular: '', email: '',
    endereco: { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' },
    cnh: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  // Controle do modal de cadastro
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('ESCOLHA'); // 'ESCOLHA', 1, 2, 3, 'SUCESSO'

  const { login, cadastrar } = useAuth();
  const navigate = useNavigate();

  const resetCadastro = () => {
    setForm({
      nome: '', usuario: '', senha: '', perfil: 'USUARIO',
      cpf: '', celular: '', email: '',
      endereco: { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' },
      cnh: '',
    });
    setError('');
    setModalStep('ESCOLHA');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetCadastro();
  };

  const handleAvancar = (nextStep) => setModalStep(nextStep);
  const handleVoltar = (prevStep) => setModalStep(prevStep);

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.usuario || !form.senha) {
      setError('Preencha usuário e senha.');
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
      setError(
        err.response?.status === 401
          ? 'Usuário ou senha incorretos. Confira seus dados e tente novamente.'
          : err.response?.data?.message || 'Não foi possível entrar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCadastroSubmit = async () => {
    setError('');
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
      {/* Background decorativo */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
      </div>

      <main className="login-card animate-fade-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo__badge" aria-hidden="true">
            <CarFront size={32} />
          </div>
          <h1 className="login-logo__title">Corridas UCL</h1>
          <p className="login-logo__subtitle">Gerenciamento inteligente de corridas</p>
        </div>

        {/* Formulário de Login */}
        <form className="login-form" onSubmit={handleLoginSubmit} noValidate>
          <Input
            id="login-usuario"
            name="usuario"
            label="Usuário"
            required
            type="text"
            placeholder="Digite seu usuário"
            value={form.usuario}
            onChange={handleChange}
            autoComplete="username"
          />

          <Input
            id="login-senha"
            name="senha"
            label="Senha"
            required
            type="password"
            showPasswordToggle
            placeholder="Digite sua senha"
            value={form.senha}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {error && (
            <div className="login-error" role="alert">
              <TriangleAlert size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <Button
            id="btn-entrar"
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>

        <div className="login-footer">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setModalOpen(true)}
            className="w-full"
          >
            Não tem uma conta? Cadastre-se
          </Button>
        </div>
      </main>

      {/* MODAL DE CADASTRO */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size={modalStep === 'ESCOLHA' || modalStep === 'SUCESSO' ? 'sm' : 'lg'}
        title={
          modalStep === 'SUCESSO'
            ? 'Cadastro Concluído!'
            : modalStep === 'ESCOLHA'
              ? 'Criar uma conta'
              : `Cadastro de ${form.perfil === 'MOTORISTA' ? 'Motorista' : 'Passageiro'}`
        }
      >
        {modalStep === 'ESCOLHA' ? (
          <div>
            <p className="text-secondary" style={{ marginBottom: 16 }}>
              Selecione o tipo de perfil que deseja criar:
            </p>
            <div className="profile-select-list">
              <button
                type="button"
                className="profile-select-btn"
                onClick={() => {
                  setForm((prev) => ({ ...prev, perfil: 'USUARIO' }));
                  setModalStep(1);
                }}
              >
                <span className="profile-select-icon" aria-hidden="true">
                  <User size={22} />
                </span>
                <span>
                  <span className="profile-select-title">Passageiro</span>
                  <span className="profile-select-desc">Solicite e acompanhe suas viagens</span>
                </span>
              </button>
              <button
                type="button"
                className="profile-select-btn"
                onClick={() => {
                  setForm((prev) => ({ ...prev, perfil: 'MOTORISTA' }));
                  setModalStep(1);
                }}
              >
                <span className="profile-select-icon" aria-hidden="true">
                  <Car size={22} />
                </span>
                <span>
                  <span className="profile-select-title">Motorista</span>
                  <span className="profile-select-desc">Aceite corridas e acompanhe seus ganhos</span>
                </span>
              </button>
            </div>
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Fechar
              </Button>
            </div>
          </div>
        ) : modalStep === 'SUCESSO' ? (
          <div className="signup-success">
            <div className="signup-success__icon" aria-hidden="true">
              <CheckCircle2 size={56} strokeWidth={1.75} />
            </div>
            <h3 className="signup-success__title">Obrigado por usar o Corridas UCL!</h3>
            <p className="signup-success__desc">
              Seu cadastro foi realizado com sucesso. Para acessar a plataforma, utilize o login gerado abaixo.
            </p>
            <div className="signup-username-box">
              <span className="signup-username-box__label">Seu login de acesso</span>
              <strong className="signup-username-box__value">{registeredUser?.usuario}</strong>
            </div>
            <p className="signup-success__note">
              <TriangleAlert size={14} aria-hidden="true" />
              <span>A sua senha de acesso é a mesma que você criou na etapa anterior.</span>
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => { handleCloseModal(); navigate('/login'); }}
            >
              Ir para o Login
            </Button>
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
            onClearError={() => setError('')}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
