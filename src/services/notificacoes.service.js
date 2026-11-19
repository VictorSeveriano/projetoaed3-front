import api from './api';

let listarEmAndamento = null;

const notificacoesService = {
  async listar() {
    if (listarEmAndamento) {
      return listarEmAndamento;
    }

    listarEmAndamento = api
      .get('/notificacoes')
      .then(({ data }) => data.data)
      .finally(() => {
        listarEmAndamento = null;
      });

    return listarEmAndamento;
  },

  async lerTodas() {
    const { data } = await api.patch('/notificacoes/ler-todas');
    return data.data;
  },

  async ler(id) {
    const { data } = await api.patch(`/notificacoes/${id}/ler`);
    return data.data;
  },
};

export default notificacoesService;
