import api from './api';

/**
 * RotasService — Centraliza comunicacao com os endpoints de rotas.
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
};

export default rotasService;
