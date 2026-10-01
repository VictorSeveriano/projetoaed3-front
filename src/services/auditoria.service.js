import api from './api';

const auditoriaService = {
  async listar(filtros = {}, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    if (filtros.perfil) params.append('perfil', filtros.perfil);
    if (filtros.modulo) params.append('modulo', filtros.modulo);
    if (filtros.acao) params.append('acao', filtros.acao);
    if (filtros.resultado) params.append('resultado', filtros.resultado);

    const { data } = await api.get(`/auditoria?${params.toString()}`);
    return data; // { data: [...], meta: { total, page, ... } }
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/auditoria/${id}`);
    return data.data;
  }
};

export default auditoriaService;
