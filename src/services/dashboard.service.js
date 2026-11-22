import api from './api';
import cacheSessao from './cacheSessao';

const TTL_DASHBOARD_MS = 25000;

class DashboardService {
  /**
   * Busca resumo e todas as séries de gráficos em uma única requisição consolidada.
   */
  async getCompleto({ forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      'dashboard:completo',
      TTL_DASHBOARD_MS,
      async () => {
        const response = await api.get('/dashboard/completo');
        return response.data;
      },
      { forcar }
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
