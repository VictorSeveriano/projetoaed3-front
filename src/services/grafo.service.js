import api from './api';

/**
 * grafoService — Acesso aos dados do grafo interno.
 *
 * Mantido para retrocompatibilidade e para endpoints que expõem
 * a estrutura interna do grafo (vértices, arestas, adjacência).
 *
 * Para cálculo de rota com dados reais do Google Maps,
 * utilize o rotasService.
 */
const grafoService = {
  /**
   * Retorna a estrutura completa do grafo (vértices, arestas, adjacência).
   * Inclui coordenadas geográficas reais em cada vértice.
   */
  async obterGrafo() {
    const { data } = await api.get('/grafo');
    return data;
  },

  /**
   * Calcula a rota via algoritmo de Dijkstra (apenas dados internos,
   * sem enriquecimento com Google Maps).
   *
   * @param {string} origem
   * @param {string} destino
   */
  async calcularRota(origem, destino) {
    const { data } = await api.get('/grafo/rota', {
      params: { origem, destino },
    });
    return data;
  },
};

export default grafoService;
