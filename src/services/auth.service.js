import api from './api';

const authService = {
  async login(usuario, senha) {
    const { data } = await api.post('/auth/login', { usuario, senha });
    return data;
  },

  async verificarDisponibilidadeCadastro(dados) {
    const { data } = await api.post('/auth/verificar-disponibilidade-cadastro', dados);
    return data.data;
  },

  async cadastrar(dados) {
    const { data } = await api.post('/auth/cadastrar', dados);
    return data;
  },

  async verificarIdentidade(usuario, cpf) {
    const { data } = await api.post('/auth/verificar-identidade', { usuario, cpf });
    return data;
  },

  async redefinirSenha(usuario, cpf, novaSenha) {
    const { data } = await api.post('/auth/redefinir-senha', { usuario, cpf, novaSenha });
    return data;
  },
};

export default authService;
