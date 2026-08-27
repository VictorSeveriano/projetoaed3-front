import api from './api';

class DashboardService {
  async getResumo() {
    const response = await api.get('/dashboard/resumo');
    return response.data;
  }

  async getReservas() {
    const response = await api.get('/dashboard/reservas');
    return response.data;
  }

  async getLocais() {
    const response = await api.get('/dashboard/locais');
    return response.data;
  }

  async getCarros() {
    const response = await api.get('/dashboard/carros');
    return response.data;
  }

  async getReceitas() {
    const response = await api.get('/dashboard/receitas');
    return response.data;
  }
}

export default new DashboardService();
