import api from './api';

const auditoriaService = {
  async listar(filtros = {}, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });

    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
    if (filtros.perfil) params.append('perfil', filtros.perfil);
    if (filtros.resultado) params.append('resultado', filtros.resultado);
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);

    const { data } = await api.get(`/auditoria?${params.toString()}`);
    return data;
  },
};

export default auditoriaService;
