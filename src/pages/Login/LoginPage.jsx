import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CarFront, TriangleAlert } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '', perfil: 'USUARIO' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, cadastrar } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!form.usuario || !form.senha) {
        setError('Preencha usuario e senha.');
        return;
      }
      setLoading(true);
      try {
        await login(form.usuario, form.senha);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Credenciais inválidas.');
      } finally {
        setLoading(false);
      }
    } else {
      // Cadastro
      if (!form.nome || !form.usuario || !form.senha) {
        setError('Preencha todos os campos.');
        return;
      }
      setLoading(true);
      try {
        await cadastrar({ nome: form.nome, usuario: form.usuario, senha: form.senha, perfil: form.perfil });
        // O RedirectInicial (AppRoutes) cuidara de mandar para o destino correto pelo perfil.
        // Vamos forçar o reload da page ou navegar pra raiz:
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao criar conta.');
      } finally {
        setLoading(false);
      }
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

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label" htmlFor="login-nome">Nome Completo</label>
              <input
                id="login-nome"
                name="nome"
                type="text"
                className="input-field"
                placeholder="Ex: Seu Nome Completo"
                value={form.nome}
                onChange={handleChange}
                autoFocus
              />
            </div>
          )}

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

          {!isLogin && (
            <div className="input-group">
              <label className="input-label" htmlFor="login-perfil">Perfil desejado</label>
              <select
                id="login-perfil"
                name="perfil"
                className="input-field"
                value={form.perfil}
                onChange={handleChange}
              >
                <option value="USUARIO">Passageiro (Solicitar corridas)</option>
                <option value="MOTORISTA">Motorista (Oferecer corridas)</option>
              </select>
            </div>
          )}

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
            {loading ? <span className="btn__spinner" /> : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button 
            type="button" 
            className="btn btn-ghost" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setForm({ nome: '', usuario: '', senha: '', perfil: 'USUARIO' });
            }}
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>

        {isLogin && (
          <p className="login-hint">
            Credenciais padrão: <strong>admin</strong> / <strong>admin123</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
