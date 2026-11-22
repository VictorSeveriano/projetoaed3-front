import api from './api';
import cacheSessao from './cacheSessao';

const TTL_LISTA_MS = 12000;
const TTL_RESUMO_MS = 15000;

const notificacoesService = {
  async listar({ forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      'notificacoes:listar',
      TTL_LISTA_MS,
      () => api.get('/notificacoes').then(({ data }) => data.data),
      { forcar }
    );
  },

  /**
   * Consulta leve usada pela Sidebar para badges (apenas contagens de não lidas por tipo).
   */
  async obterResumo({ forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      'notificacoes:resumo',
      TTL_RESUMO_MS,
      () => api.get('/notificacoes/resumo').then(({ data }) => data.data),
      { forcar }
    );
  },

  async lerTodas() {
    const { data } = await api.patch('/notificacoes/ler-todas');
    cacheSessao.invalidarPrefixo('notificacoes:');
    return data.data;
  },

  async ler(id) {
    const { data } = await api.patch(`/notificacoes/${id}/ler`);
    cacheSessao.invalidarPrefixo('notificacoes:');
    return data.data;
  },
};

export default notificacoesService;
