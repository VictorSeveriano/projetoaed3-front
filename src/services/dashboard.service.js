import api from './api';
import cacheSessao from './cacheSessao';
import { baixarRelatorioApi, construirParamsFiltroLimpos } from '../utils/downloadArquivo';

const TTL_DASHBOARD_MS = 25000;

class DashboardService {
  /**
   * Busca resumo e todas as séries de gráficos em uma única requisição consolidada,
   * respeitando filtros opcionais (`dataInicio`, `dataFim`, `status`, `classe`).
   */
  async getCompleto(filtros = {}, { forcar = false } = {}) {
    const params = construirParamsFiltroLimpos(filtros);
    const query = params.toString();
    const url = query ? `/dashboard/completo?${query}` : '/dashboard/completo';

    return cacheSessao.obterOuCarregar(
      `dashboard:completo:${query}`,
      TTL_DASHBOARD_MS,
      async () => {
        const response = await api.get(url);
        return response.data;
      },
      { forcar }
    );
  }

  async exportarRelatorio(formato = 'csv', filtros = {}) {
    return baixarRelatorioApi(
      '/dashboard/exportar',
      formato,
      filtros,
      'relatorio-dashboard-corridas-ucl'
    );
  }

  async getResumo() {
    const response = await api.get('/dashboard/resumo');
    return response.data;
  }

  async getCorridas() {
    const response = await api.get('/dashboard/corridas');
    return response.data;
  }

  async getOrigens() {
    const response = await api.get('/dashboard/origens');
    return response.data;
  }

  async getDestinos() {
    const response = await api.get('/dashboard/destinos');
    return response.data;
  }

  async getRotas() {
    const response = await api.get('/dashboard/rotas');
    return response.data;
  }

  async getVeiculos() {
    const response = await api.get('/dashboard/veiculos');
    return response.data;
  }

  async getFaturamento() {
    const response = await api.get('/dashboard/faturamento');
    return response.data;
  }
}

export default new DashboardService();
