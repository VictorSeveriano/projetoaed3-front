import api from './api';

const carrosService = {
  async listarTodos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.marca)     params.append('marca', filtros.marca);
    if (filtros.localizacao) params.append('localizacao', filtros.localizacao);
    if (filtros.status)    params.append('status', filtros.status);
    const { data } = await api.get(`/carros?${params.toString()}`);
    return data;
  },

  async listarDisponiveis() {
    const { data } = await api.get('/carros/disponiveis');
    return data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/carros/${id}`);
    return data;
  },
};

export default carrosService;
