import api from './api';

/**
 * CorridasService — Centraliza toda comunicação com os endpoints de corridas.
 */
const corridasService = {
  async listarPorPerfil(usuarioId, perfil, status = '') {
    const params = new URLSearchParams({ usuarioId, perfil });
    if (status) params.append('status', status);
    const { data } = await api.get(`/corridas/minhas?${params.toString()}`);
    return data.data;
  },

  async criar(dados) {
    const { data } = await api.post('/corridas', dados);
    return data.data;
  },

  /**
   * Motorista aceita uma corrida.
   * @param {string} corridaId
   * @param {string} motoristaUsuarioId - ID do usuário do motorista (não o ID do registro Motorista)
   */
  async aceitar(corridaId, motoristaUsuarioId) {
    const { data } = await api.patch(`/corridas/${corridaId}/aceitar`, { motoristaUsuarioId });
    return data.data;
  },

  /**
   * Motorista recusa uma corrida.
   */
  async recusar(corridaId, motoristaUsuarioId) {
    const { data } = await api.patch(`/corridas/${corridaId}/recusar`, { motoristaUsuarioId });
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
   * @param {string} motoristaUsuarioId
   */
  async confirmarPagamento(id, motoristaUsuarioId) {
    const { data } = await api.patch(`/corridas/${id}/confirmar-pagamento`, { motoristaUsuarioId });
    return data.data;
  },

  async finalizar(id) {
    const { data } = await api.patch(`/corridas/${id}/finalizar`);
    return data.data;
  },
};

export default corridasService;
