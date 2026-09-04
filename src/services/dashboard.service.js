import api from './api';

class DashboardService {
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

