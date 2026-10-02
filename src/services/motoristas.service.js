import api from './api';

/**
 * MotoristasService — Centraliza comunicação com endpoints de motoristas.
 */
const motoristasService = {

  async solicitar(dados) {
    const { data } = await api.post('/motoristas', dados);
    return data.data;
  },

  async listarAnalise() {
    const { data } = await api.get('/motoristas/analise');
    return data.data;
  },

  async aprovar(id) {
    const { data } = await api.patch(`/motoristas/${id}/aprovar`);
    return data.data;
  },

  async rejeitar(id) {
    const { data } = await api.patch(`/motoristas/${id}/rejeitar`);
    return data.data;
  },

  async atualizar(id, dados) {
    const { data } = await api.patch(`/motoristas/${id}`, dados);
    return data.data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/motoristas/${id}`);
    return data.data;
  },

  async buscarPorUsuarioId(usuarioId) {
    const { data } = await api.get(`/motoristas/perfil/${usuarioId}`);
    return data.data;
  },

  async listarCorridas(id) {
    const { data } = await api.get(`/motoristas/${id}/corridas`);
    return data.data;
  },

  async buscarVeiculo(id) {
    const { data } = await api.get(`/motoristas/${id}/veiculo`);
    return data.data;
  },

  async getRelatorio(id, mes, ano) {
    const { data } = await api.get(`/motoristas/${id}/relatorio`, {
      params: { mes, ano },
    });
    return data.data;
  },
};

export default motoristasService;
