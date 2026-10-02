import api from './api';

const notificacoesService = {
  async listar() {
    const { data } = await api.get('/notificacoes');
    return data.data;
  },

  async lerTodas() {
    const { data } = await api.patch('/notificacoes/ler-todas');
    return data.data;
  },

  async ler(id) {
    const { data } = await api.patch(`/notificacoes/${id}/ler`);
    return data.data;
  }
};

export default notificacoesService;
