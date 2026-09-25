import api from './api';

/**
 * UsuariosService — Centraliza comunicação com endpoints de usuários.
 */
const usuariosService = {
  async buscarPorId(id) {
    const { data } = await api.get(`/usuarios/${id}`);
    return data.data;
  },

  async listarTodos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.perfil) params.append('perfil', filtros.perfil);
    
    const { data } = await api.get(`/usuarios?${params.toString()}`);
    return data.data;
  },

  async atualizar(id, dados) {
    const { data } = await api.patch(`/usuarios/${id}`, dados);
    return data.data;
  },

  async listarCorridas(id) {
    const { data } = await api.get(`/usuarios/${id}/corridas`);
    return data.data;
  },
};

export default usuariosService;
