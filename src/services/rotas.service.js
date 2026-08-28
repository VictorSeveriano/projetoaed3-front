import api from './api';

/**
 * RotasService — Centraliza toda comunicação com os endpoints de rotas.
 *
 * Responsabilidades do frontend:
 * - Solicitar ao backend o cálculo de rota entre origem e destino
 * - Solicitar a lista de locais disponíveis
 * - Tratar erros de comunicação de forma padronizada
 *
 * O cálculo efetivo (Dijkstra + Google Maps Directions API) é
 * responsabilidade do backend. Este service apenas orquestra as chamadas.
 */
const rotasService = {
  /**
   * Calcula a melhor rota entre dois locais.
   *
   * @param {string} origem  - Nome do local de origem
   * @param {string} destino - Nome do local de destino
   * @returns {Promise<{
   *   origem: string,
   *   destino: string,
   *   caminho: string[],
   *   pontos: Array<{ nome, cidade, estado, categoria, latitude, longitude }>,
   *   distanciaKm: number,
   *   distanciaFormatada: string,
   *   duracaoSegundos: number|null,
   *   duracaoFormatada: string|null,
   *   polyline: string|null,
   *   fonte: 'google_maps'|'grafo_interno'
   * }>}
   */
  async calcularRota(origem, destino) {
    const { data } = await api.get('/rotas', {
      params: { origem, destino },
    });
    return data.data;
  },

  /**
   * Retorna todos os locais disponíveis para seleção de origem/destino.
   * Cada local inclui coordenadas reais para exibição no mapa.
   *
   * @returns {Promise<Array<{
   *   id: string,
   *   nome: string,
   *   cidade: string,
   *   estado: string,
   *   categoria: string,
   *   latitude: number,
   *   longitude: number
   * }>>}
   */
  async listarLocais() {
    const { data } = await api.get('/rotas/locais');
    return data.data;
  },

  /**
   * Calcula a agência mais próxima de um CEP/Endereço ou Coordenada.
   */
  async calcularMaisProximo(cepOuEndereco, lat, lng) {
    const { data } = await api.post('/rotas/mais-proximo', { cepOuEndereco, lat, lng });
    return data.data;
  },
};

export default rotasService;
