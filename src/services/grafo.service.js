import api from './api';

const grafoService = {
  async obterGrafo() {
    const { data } = await api.get('/grafo');
    return data;
  },

  async calcularRota(origem, destino) {
    const { data } = await api.get(`/grafo/rota?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}`);
    return data;
  },
};

export default grafoService;
