import api from './api';

const reservasService = {
  async listarTodas() {
    const { data } = await api.get('/reservas');
    return data;
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/reservas/${id}`);
    return data;
  },

  async criar(dadosReserva) {
    const { data } = await api.post('/reservas', dadosReserva);
    return data;
  },

  async cancelar(id) {
    const { data } = await api.patch(`/reservas/${id}/cancelar`);
    return data;
  },

  async deletar(id) {
    const { data } = await api.delete(`/reservas/${id}`);
    return data;
  },
};

export default reservasService;
