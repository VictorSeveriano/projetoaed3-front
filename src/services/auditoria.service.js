import api from './api';

const auditoriaService = {
  async listar(filtros = {}, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);

    const { data } = await api.get(`/auditoria?${params.toString()}`);
    return data; // { data: [...], meta: { total, page, ... } }
  },
};

export default auditoriaService;
