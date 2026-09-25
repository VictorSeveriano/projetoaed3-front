import api from './api';

const authService = {
  async login(usuario, senha) {
    const { data } = await api.post('/auth/login', { usuario, senha });
    return data;
  },

  async cadastrar(dados) {
    const { data } = await api.post('/auth/cadastrar', dados);
    return data;
  },
};

export default authService;
