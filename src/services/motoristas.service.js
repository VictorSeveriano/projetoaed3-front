import api from './api';
import cacheSessao from './cacheSessao';

const TTL_MOTORISTAS_MS = 15000;

function invalidarPosMutacaoMotorista() {
  cacheSessao.invalidarPrefixo('motoristas:');
  cacheSessao.invalidarPrefixo('veiculos:');
  cacheSessao.invalidarPrefixo('usuarios:');
  cacheSessao.invalidarPrefixo('notificacoes:');
}

/**
 * MotoristasService — Centraliza comunicação com endpoints de motoristas.
 */
const motoristasService = {
  async solicitar(dados) {
    const { data } = await api.post('/motoristas', dados);
    invalidarPosMutacaoMotorista();
    return data.data;
  },

  async listarAnalise({ forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      'motoristas:analise',
      TTL_MOTORISTAS_MS,
      () => api.get('/motoristas/analise').then(({ data }) => data.data),
      { forcar }
    );
  },

  async aprovar(id) {
    const { data } = await api.patch(`/motoristas/${id}/aprovar`);
    invalidarPosMutacaoMotorista();
    return data.data;
  },

  async rejeitar(id) {
    const { data } = await api.patch(`/motoristas/${id}/rejeitar`);
    invalidarPosMutacaoMotorista();
    return data.data;
  },

  async atualizar(id, dados) {
    const { data } = await api.patch(`/motoristas/${id}`, dados);
    invalidarPosMutacaoMotorista();
    return data.data;
  },

  async buscarPorUsuarioId(usuarioId, { forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      `motoristas:perfil:${usuarioId}`,
      TTL_MOTORISTAS_MS,
      () => api.get(`/motoristas/perfil/${usuarioId}`).then(({ data }) => data.data),
      { forcar }
    );
  },

  async buscarVeiculo(id) {
    const { data } = await api.get(`/motoristas/${id}/veiculo`);
    return data.data;
  },

  async getRelatorio(id, mes, ano, { forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      `motoristas:relatorio:${id}:${mes}:${ano}`,
      TTL_MOTORISTAS_MS,
      () => api.get(`/motoristas/${id}/relatorio`, { params: { mes, ano } }).then(({ data }) => data.data),
      { forcar }
    );
  },
};

export default motoristasService;
