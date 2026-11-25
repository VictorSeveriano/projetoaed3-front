import api from './api';
import cacheSessao from './cacheSessao';
import { serializarFiltrosParaQuery } from '../utils/indicadorAtrasoCorrida';

const TTL_CORRIDAS_MS = 12000;
const TTL_TIMELINE_MS = 8000;

function invalidarPosMutacaoCorrida() {
  cacheSessao.invalidarPrefixo('corridas:');
  cacheSessao.invalidarPrefixo('dashboard:');
  cacheSessao.invalidarPrefixo('veiculos:');
  cacheSessao.invalidarPrefixo('motoristas:');
  cacheSessao.invalidarPrefixo('notificacoes:');
}

function extrairNomeArquivoContentDisposition(headerValue, fallback) {
  if (!headerValue || typeof headerValue !== 'string') return fallback;
  const match = headerValue.match(/filename="?([^";]+)"?/i);
  return match && match[1] ? match[1].trim() : fallback;
}

/**
 * CorridasService — Centraliza toda comunicação com os endpoints de corridas,
 * histórico paginado, linha do tempo sob demanda e exportação de relatórios.
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

  /**
   * Consulta paginada e filtrada no backend (`GET /api/corridas/historico`).
   */
  async consultarHistorico(filtros = {}, { page = 1, limit = 15, ordenarPor = 'dataHorario', direcao = 'desc', escopo = 'TODAS', forcar = false } = {}) {
    const params = serializarFiltrosParaQuery(filtros, { page, limit, ordenarPor, direcao, escopo });
    const query = params.toString();
    return cacheSessao.obterOuCarregar(
      `corridas:historico:${query}`,
      TTL_CORRIDAS_MS,
      () =>
        api.get(`/corridas/historico?${query}`).then(({ data }) => ({
          data: data.data || [],
          meta: data.meta || null,
        })),
      { forcar }
    );
  },

  /**
   * Carrega sob demanda os detalhes completos e a linha do tempo de uma única corrida.
   */
  async obterLinhaDoTempo(corridaId, { forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      `corridas:timeline:${corridaId}`,
      TTL_TIMELINE_MS,
      () => api.get(`/corridas/${corridaId}/linha-do-tempo`).then(({ data }) => data.data),
      { forcar }
    );
  },

  /**
   * Solicita exportação em CSV ou PDF com os mesmos filtros ativos e inicia o download no navegador.
   */
  async exportarRelatorio(formato = 'csv', filtros = {}, extras = {}) {
    const fmt = String(formato || 'csv').toLowerCase();
    const params = serializarFiltrosParaQuery(filtros, { ...extras, formato: fmt });
    try {
      const response = await api.get(`/corridas/exportar?${params.toString()}`, {
        responseType: 'blob',
      });
      const fallbackName = `relatorio-corridas-ucl.${fmt}`;
      const filename = extrairNomeArquivoContentDisposition(
        response.headers?.['content-disposition'],
        fallbackName
      );
      const blob = new Blob([response.data], {
        type: fmt === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return { filename };
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        try {
          const texto = await err.response.data.text();
          const json = JSON.parse(texto);
          if (json?.message) {
            throw new Error(json.message);
          }
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message && !parseErr.message.includes('JSON')) {
            throw parseErr;
          }
        }
      }
      throw new Error(err?.response?.data?.message || err?.message || 'Falha ao exportar relatório.');
    }
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

  async aceitar(corridaId) {
    const { data } = await api.patch(`/corridas/${corridaId}/aceitar`);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

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

  async confirmarPagamento(id) {
    const { data } = await api.patch(`/corridas/${id}/confirmar-pagamento`);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

  async registrarEmbarqueMotorista(id, payload) {
    const { data } = await api.patch(`/corridas/${id}/embarque/motorista`, payload);
    invalidarPosMutacaoCorrida();
    return data.data;
  },

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
