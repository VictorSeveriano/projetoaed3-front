import api from './api';
import cacheSessao from './cacheSessao';

const TTL_USUARIOS_MS = 15000;

function invalidarPosMutacaoUsuario() {
  cacheSessao.invalidarPrefixo('usuarios:');
  cacheSessao.invalidarPrefixo('motoristas:');
  cacheSessao.invalidarPrefixo('veiculos:');
}

/**
 * UsuariosService — Centraliza comunicação com endpoints de usuários.
 */
const usuariosService = {
  async buscarPorId(id) {
    const { data } = await api.get(`/usuarios/${id}`);
    return data.data;
  },

  async listarTodos(filtros = {}, { forcar = false } = {}) {
    const params = new URLSearchParams();
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.perfil) params.append('perfil', filtros.perfil);

    const query = params.toString();
    const url = query ? `/usuarios?${query}` : '/usuarios';

    return cacheSessao.obterOuCarregar(
      `usuarios:lista:${query}`,
      TTL_USUARIOS_MS,
      () => api.get(url).then(({ data }) => data.data),
      { forcar }
    );
  },

  async atualizar(id, dados) {
    const { data } = await api.patch(`/usuarios/${id}`, dados);
    invalidarPosMutacaoUsuario();
    return data.data;
  },

  async excluir(id) {
    const { data } = await api.delete(`/usuarios/${id}`);
    invalidarPosMutacaoUsuario();
    return data.data;
  },

  async criar(dados) {
    const { data } = await api.post('/usuarios', dados);
    invalidarPosMutacaoUsuario();
    return data.data;
  },
};

export default usuariosService;
