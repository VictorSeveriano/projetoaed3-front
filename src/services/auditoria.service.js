import api from './api';
import cacheSessao from './cacheSessao';

const TTL_AUDITORIA_MS = 12000;

const auditoriaService = {
  async listar(filtros = {}, page = 1, limit = 20, { forcar = false } = {}) {
    const params = new URLSearchParams({ page, limit });

    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
    if (filtros.perfil) params.append('perfil', filtros.perfil);
    if (filtros.resultado) params.append('resultado', filtros.resultado);
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);

    const query = params.toString();
    return cacheSessao.obterOuCarregar(
      `auditoria:lista:${query}`,
      TTL_AUDITORIA_MS,
      () => api.get(`/auditoria?${query}`).then(({ data }) => data),
      { forcar }
    );
  },
};

export default auditoriaService;
