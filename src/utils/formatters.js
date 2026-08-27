export const formatarData = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
};

export const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export const calcularDias = (dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diff = fim - inicio;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const STATUS_LABELS = {
  ATIVA:      { label: 'Ativa',      color: 'success' },
  CANCELADA:  { label: 'Cancelada',  color: 'danger'  },
  FINALIZADA: { label: 'Finalizada', color: 'muted'   },
  DISPONIVEL: { label: 'Disponivel', color: 'success' },
  RESERVADO:  { label: 'Reservado',  color: 'warning' },
};
