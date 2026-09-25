import api from './api';

const veiculosService = {
  async listarTodos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.motoristaId) params.append('motoristaId', filtros.motoristaId);
    
    const { data } = await api.get(`/veiculos?${params.toString()}`);
    return data.data;
  },

  async listarAnalise() {
    const { data } = await api.get('/veiculos/analise');
    return data.data;
  },

  async cadastrar(dados) {
    const { data } = await api.post('/veiculos', dados);
    return data.data;
  },

  async aprovar(id, classe) {
    const { data } = await api.patch(`/veiculos/${id}/aprovar`, { classe });
    return data.data;
  },

  async rejeitar(id) {
    const { data } = await api.patch(`/veiculos/${id}/rejeitar`);
    return data.data;
  },

  async editarClasse(id, classe) {
    const { data } = await api.patch(`/veiculos/${id}/classe`, { classe });
    return data.data;
  }
};

export default veiculosService;
