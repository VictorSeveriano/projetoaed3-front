import api from './api';

const localizacoesService = {
  async listarTodas() {
    const { data } = await api.get('/localizacoes');
    return data;
  },
};

export default localizacoesService;
