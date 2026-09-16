import api from './api';

/**
 * LocalizacaoService — Centraliza a busca de sugestoes de localizacao.
 *
 * Responsabilidade unica: consultar o endpoint de autocomplete do backend.
 * Separado de rotas.service.js para manter coesao de responsabilidade.
 *
 * Fluxo:
 *   Usuario digita -> debounce (no hook) -> buscarSugestoes(q)
 *     -> GET /api/rotas/sugestoes?q=...
 *     -> Backend consulta Nominatim -> retorna array normalizado
 *     -> Hook exibe no dropdown
 */
const localizacaoService = {
  /**
   * Busca sugestoes de localizacao para autocomplete.
   *
   * @param {string} query - Texto digitado (minimo 3 chars, validado tambem no backend)
   * @param {AbortSignal} [signal] - AbortController.signal para cancelar a requisicao
   * @returns {Promise<Array<{
   *   descricao: string,
   *   logradouro: string,
   *   numero: string,
   *   complemento: string,
   *   bairro: string,
   *   cidade: string,
   *   estado: string,
   *   cep: string,
   *   latitude: number,
   *   longitude: number
   * }>>}
   */
  async buscarSugestoes(query, signal) {
    const { data } = await api.get('/rotas/sugestoes', {
      params: { q: query },
      signal,
    });
    // data.data e o array de sugestoes conforme responseHelper.success()
    return Array.isArray(data.data) ? data.data : [];
  },
};

export default localizacaoService;
