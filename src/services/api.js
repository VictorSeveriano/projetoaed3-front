import axios from 'axios';

const hostPadrao = typeof window !== 'undefined' && window.location?.hostname
  ? window.location.hostname
  : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostPadrao}:3001/api`;

export const AUTH_STORAGE_KEYS = Object.freeze({
  TOKEN: 'auth_token',
  USUARIO: 'usuario',
});

/**
 * Remove exclusivamente as chaves de sessão de autenticação do sessionStorage,
 * preservando outros dados temporários de navegação ou formulários.
 */
export const clearAuthSession = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.USUARIO);
};

/**
 * Instancia configurada do axios.
 * Interceptors preparados para adicionar token de autenticacao.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Interceptor de requisicao: adiciona token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta: trata erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url?.replace(/\/+$/, '');
    const isLoginRequest = url?.endsWith('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      clearAuthSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
