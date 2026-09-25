import api from './api';

/**
 * CorridasService — Centraliza toda comunicação com os endpoints de corridas.
 */
const corridasService = {
  async listarPorPerfil(usuarioId, perfil, status = '') {
    const params = new URLSearchParams({ usuarioId, perfil });
    if (status) params.append('status', status);
    const { data } = await api.get(`/corridas/minhas?${params.toString()}`);
    return data.data;
  },

  async criar(dados) {
    const { data } = await api.post('/corridas', dados);
    return data.data;
  },

  async cancelar(id) {
    const { data } = await api.patch(`/corridas/${id}/cancelar`);
    return data.data;
  },

  async finalizar(id) {
    const { data } = await api.patch(`/corridas/${id}/finalizar`);
    return data.data;
  },
};

export default corridasService;
