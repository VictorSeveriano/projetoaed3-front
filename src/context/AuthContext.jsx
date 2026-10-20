import React, { createContext, useContext, useState, useCallback } from 'react';
import authService from '../services/auth.service';
import { AUTH_STORAGE_KEYS, clearAuthSession } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEYS.USUARIO);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (usuarioInput, senha) => {
    const response = await authService.login(usuarioInput, senha);
    const { token, usuario: userData } = response.data;
    sessionStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    sessionStorage.setItem(AUTH_STORAGE_KEYS.USUARIO, JSON.stringify(userData));
    setUsuario(userData);
    return userData;
  }, []);

  const cadastrar = useCallback(async (dados) => {
    const response = await authService.cadastrar(dados);
    const { usuario: userData } = response.data;
    // Não cria sessão automaticamente — o usuário deve fazer login manualmente
    // após o cadastro para que o redirecionamento respeite o perfil corretamente.
    return userData;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUsuario(null);
  }, []);

  const isAuthenticated = Boolean(usuario);

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
