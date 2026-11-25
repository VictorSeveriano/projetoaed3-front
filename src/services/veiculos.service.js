import api from './api';
import cacheSessao from './cacheSessao';
import { baixarRelatorioApi } from '../utils/downloadArquivo';

const TTL_VEICULOS_MS = 15000;

function invalidarPosMutacaoVeiculo() {
  cacheSessao.invalidarPrefixo('veiculos:');
  cacheSessao.invalidarPrefixo('dashboard:');
  cacheSessao.invalidarPrefixo('motoristas:');
  cacheSessao.invalidarPrefixo('notificacoes:');
}

const veiculosService = {
  async listarTodos(filtros = {}, { forcar = false } = {}) {
    const params = new URLSearchParams();
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.classe) params.append('classe', filtros.classe);
    if (filtros.motoristaId) params.append('motoristaId', filtros.motoristaId);
    if (filtros.porte) params.append('porte', filtros.porte);

    const query = params.toString();
    const url = query ? `/veiculos?${query}` : '/veiculos';

    return cacheSessao.obterOuCarregar(
      `veiculos:lista:${query}`,
      TTL_VEICULOS_MS,
      () => api.get(url).then(({ data }) => data.data),
      { forcar }
    );
  },

  async exportarRelatorio(formato = 'csv', filtros = {}) {
    return baixarRelatorioApi(
      '/veiculos/exportar',
      formato,
      filtros,
      'relatorio-veiculos-corridas-ucl'
    );
  },

  async listarAnalise({ forcar = false } = {}) {
    return cacheSessao.obterOuCarregar(
      'veiculos:analise',
      TTL_VEICULOS_MS,
      () => api.get('/veiculos/analise').then(({ data }) => data.data),
      { forcar }
    );
  },

  async cadastrar(dados) {
    const { data } = await api.post('/veiculos', dados);
    invalidarPosMutacaoVeiculo();
    return data.data;
  },

  async aprovar(id) {
    const { data } = await api.patch(`/veiculos/${id}/aprovar`);
    invalidarPosMutacaoVeiculo();
    return data.data;
  },

  async rejeitar(id) {
    const { data } = await api.patch(`/veiculos/${id}/rejeitar`);
    invalidarPosMutacaoVeiculo();
    return data.data;
  },

  async atualizar(id, dados) {
    const { data } = await api.patch(`/veiculos/${id}`, dados);
    invalidarPosMutacaoVeiculo();
    return data.data;
  },

  async excluir(id) {
    const { data } = await api.delete(`/veiculos/${id}`);
    invalidarPosMutacaoVeiculo();
    return data.data;
  },
};

export default veiculosService;
