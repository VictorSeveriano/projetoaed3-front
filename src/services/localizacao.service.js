import api from './api';
import {
  obterEnderecoOrigemPorGps,
  traduzirErroGeolocalizacao,
} from '../utils/corridaPayload';

export { obterEnderecoOrigemPorGps, traduzirErroGeolocalizacao };

/**
 * LocalizacaoService — Centraliza a busca de sugestões e geocodificação reversa de localização.
 */
const localizacaoService = {
  /**
   * Busca sugestões de localização para autocomplete.
   *
   * @param {string} query - Texto digitado (mínimo 3 chars, validado também no backend)
   * @param {AbortSignal} [signal] - AbortController.signal para cancelar a requisição
   */
  async buscarSugestoes(query, signal) {
    const { data } = await api.get('/rotas/sugestoes', {
      params: { q: query },
      signal,
    });
    return Array.isArray(data.data) ? data.data : [];
  },

  /**
   * Converte coordenadas geográficas (latitude e longitude) em endereço legível.
   *
   * @param {number} latitude
   * @param {number} longitude
   * @param {AbortSignal} [signal]
   */
  async geocodificarReverso(latitude, longitude, signal) {
    const { data } = await api.get('/rotas/reverso', {
      params: { lat: latitude, lng: longitude },
      signal,
    });
    return data.data;
  },

  /**
   * Obtém a localização atual por GPS e converte em endereço legível.
   */
  async obterEnderecoPorGps(opcoes = {}) {
    return obterEnderecoOrigemPorGps({
      geocodificarReverso: (lat, lng) => this.geocodificarReverso(lat, lng),
      ...opcoes,
    });
  },
};

export default localizacaoService;
