import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CarFront, TriangleAlert } from 'lucide-react';

const LoginPage = () => {
  const [form, setForm] = useState({ usuario: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usuario || !form.senha) {
      setError('Preencha usuario e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(form.usuario, form.senha);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais invalidas.');
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

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
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
              autoFocus
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

        <p className="login-hint">
          Credenciais padrão: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
