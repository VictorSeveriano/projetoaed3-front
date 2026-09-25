import api from './api';

/**
 * UsuariosService — Centraliza comunicação com endpoints de usuários.
 */
const usuariosService = {
  async buscarPorId(id) {
    const { data } = await api.get(`/usuarios/${id}`);
    return data.data;
  },

  async listarCorridas(id) {
    const { data } = await api.get(`/usuarios/${id}/corridas`);
    return data.data;
  },
};

export default usuariosService;
