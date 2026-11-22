import api from './api';
import cacheSessao from './cacheSessao';

const TTL_CORRIDAS_MS = 12000;

function invalidarPosMutacaoCorrida() {
  cacheSessao.invalidarPrefixo('corridas:');
  cacheSessao.invalidarPrefixo('dashboard:');
  cacheSessao.invalidarPrefixo('veiculos:');
  cacheSessao.invalidarPrefixo('motoristas:');
  cacheSessao.invalidarPrefixo('notificacoes:');
}

/**
 * CorridasService — Centraliza toda comunicação com os endpoints de corridas.
 */
const corridasService = {
  async listarPorPerfil(status = '', { forcar = false } = {}) {
    const chaveStatus = String(status || '');
    return cacheSessao.obterOuCarregar(
      `corridas:perfil:${chaveStatus}`,
      TTL_CORRIDAS_MS,
      () => {
        const params = new URLSearchParams();
        if (chaveStatus) params.append('status', chaveStatus);
        const query = params.toString();
        const url = query ? `/corridas/minhas?${query}` : '/corridas/minhas';
        return api.get(url).then(({ data }) => data.data);
      },
      { forcar }
    );
  },

  async criar(dados) {
    const { data } = await api.post('/corridas', dados);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

  async calcularValorPrevia({ distanciaKm, classe, dataHorario }) {
    const { data } = await api.post('/corridas/calcular-valor', { distanciaKm, classe, dataHorario });
    return data.data;
  },

  /**
   * Motorista aceita uma corrida.
   * @param {string} corridaId
   */
  async aceitar(corridaId) {
    const { data } = await api.patch(`/corridas/${corridaId}/aceitar`);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

  /**
   * Motorista recusa uma corrida.
   */
  async recusar(corridaId) {
    const { data } = await api.patch(`/corridas/${corridaId}/recusar`);
    cacheSessao.invalidarPrefixo('notificacoes:');
    return data.data;
  },

  async cancelar(id, dados = {}) {
    const { data } = await api.patch(`/corridas/${id}/cancelar`, dados);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

  /**
   * Motorista confirma recebimento do pagamento.
   * A corrida só é FINALIZADA após este passo.
   * @param {string} id
   */
  async confirmarPagamento(id) {
    const { data } = await api.patch(`/corridas/${id}/confirmar-pagamento`);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

  /**
   * Decisão do motorista sobre o embarque.
   * @param {string} id
   * @param {{ acao: 'CONFIRMAR_EMBARQUE'|'ESTOU_A_CAMINHO'|'NAO_VOU_EMBARCAR', motivo?: string }} payload
   */
  async registrarEmbarqueMotorista(id, payload) {
    const { data } = await api.patch(`/corridas/${id}/embarque/motorista`, payload);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

  /**
   * Confirmação do passageiro sobre o embarque.
   * @param {string} id
   * @param {{ acao: 'CONFIRMAR_EMBARQUE'|'NAO_EMBARQUEI', cancelarViagem?: boolean, motivo?: string }} payload
   */
  async registrarEmbarquePassageiro(id, payload) {
    const { data } = await api.patch(`/corridas/${id}/embarque/passageiro`, payload);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

  async finalizar(id) {
    const { data } = await api.patch(`/corridas/${id}/finalizar`);
    invalidarPosMutacaoCorrida();
    return data.data;
  },
};

export default corridasService;
