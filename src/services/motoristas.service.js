import api from './api';

/**
 * MotoristasService — Centraliza comunicação com endpoints de motoristas.
 */
const motoistasService = {
  async buscarPorId(id) {
    const { data } = await api.get(`/motoristas/${id}`);
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

export default motoistasService;
