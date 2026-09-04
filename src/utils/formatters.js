export const formatarData = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
};

export const formatarDataHorario = (isoStr) => {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

export const STATUS_LABELS = {
  CONFIRMADA:   { label: 'Confirmada',   color: 'success' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'warning' },
  FINALIZADA:   { label: 'Finalizada',   color: 'muted'   },
  CANCELADA:    { label: 'Cancelada',    color: 'danger'  },
  DISPONIVEL:   { label: 'Disponivel',   color: 'success' },
  EM_CORRIDA:   { label: 'Em Corrida',   color: 'warning' },
  RESERVADO:    { label: 'Reservado',    color: 'warning' },
};

