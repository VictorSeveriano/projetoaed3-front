import api from './api';

const authService = {
  async login(usuario, senha) {
    const { data } = await api.post('/auth/login', { usuario, senha });
    return data;
  },
};

export default authService;
