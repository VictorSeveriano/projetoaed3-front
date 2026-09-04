import api from './api';

/**
 * RotasService — Centraliza comunicacao com os endpoints de rotas.
 *
 * Responsabilidades:
 * - Calcular multiplas rotas entre origem e destino (BFS + Dijkstra via backend)
 * - Geocodificar CEP (ViaCEP + Nominatim via backend)
 * - Listar locais disponiveis
 *
 * O calculo efetivo e responsabilidade do backend.
 */
const rotasService = {
  /**
   * Calcula multiplas rotas alternativas entre dois locais dinamicos.
   *
   * @param {{ nome: string, lat: number, lng: number }} origem
   * @param {{ nome: string, lat: number, lng: number }} destino
   * @returns {Promise<{ origemNome, destinoNome, rotas: Array, melhorRota: object }>}
   */
  async calcularCorrida(origem, destino) {
    const { data } = await api.post('/rotas/calcular-corrida', { origem, destino });
    return data.data;
  },

  /**
   * Geocodifica um CEP ou endereco livre.
   * Fluxo: CEP -> ViaCEP -> endereco JSON -> Nominatim -> lat/lng
   *
   * @param {string} entrada - CEP (com ou sem hifen) ou endereco livre
   * @returns {Promise<{ endereco: object, latitude: number, longitude: number }>}
   */
  async geocodificarCep(entrada) {
    const ehCep = entrada.replace(/\D/g, '').length === 8;
    const body = ehCep ? { cep: entrada } : { endereco: entrada };
    const { data } = await api.post('/rotas/geocodificar', body);
    return data.data;
  }
};

export default rotasService;

