import api from './api';

const notificacoesService = {
  async listar(destinatarioId) {
    const { data } = await api.get(`/notificacoes?destinatarioId=${destinatarioId}`);
    return data.data;
  },

  async lerTodas(destinatarioId) {
    const { data } = await api.patch(`/notificacoes/ler-todas?destinatarioId=${destinatarioId}`);
    return data.data;
  },

  async ler(id) {
    const { data } = await api.patch(`/notificacoes/${id}/ler`);
    return data.data;
  }
};

export default notificacoesService;
