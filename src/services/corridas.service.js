import api from './api';

/**
 * CorridasService — Centraliza toda comunicação com os endpoints de corridas.
 */
const corridasService = {
  async listarPorPerfil(status = '') {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const { data } = await api.get(`/corridas/minhas?${params.toString()}`);
    return data.data;
  },

  async criar(dados) {
    const { data } = await api.post('/corridas', dados);
    return data.data;
  },

  async calcularValorPrevia({ distanciaKm, classe, dataHorario }) {
    const { data } = await api.post('/corridas/calcular-valor', { distanciaKm, classe, dataHorario });
    return data.data; // should return { valor: number }
  },

  /**
   * Motorista aceita uma corrida.
   * @param {string} corridaId
   */
  async aceitar(corridaId) {
    const { data } = await api.patch(`/corridas/${corridaId}/aceitar`);
    return data.data;
  },

  /**
   * Motorista recusa uma corrida.
   */
  async recusar(corridaId) {
    const { data } = await api.patch(`/corridas/${corridaId}/recusar`);
    return data.data;
  },

  async cancelar(id) {
    const { data } = await api.patch(`/corridas/${id}/cancelar`);
    return data.data;
  },

  /**
   * Motorista confirma recebimento do pagamento.
   * A corrida só é FINALIZADA após este passo.
   * @param {string} id
   */
  async confirmarPagamento(id) {
    const { data } = await api.patch(`/corridas/${id}/confirmar-pagamento`);
    return data.data;
  },

  async finalizar(id) {
    const { data } = await api.patch(`/corridas/${id}/finalizar`);
    return data.data;
  },
};

export default corridasService;
