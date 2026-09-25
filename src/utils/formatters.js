export const formatarData = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
};

export const formatarDataHorario = (isoStr) => {
  if (!isoStr) return '—';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

export const STATUS_LABELS = {
  SOLICITADA:   { label: 'Solicitada',   color: 'info'    },
  CONFIRMADA:   { label: 'Confirmada',   color: 'success' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'warning' },
  FINALIZADA:   { label: 'Finalizada',   color: 'muted'   },
  CANCELADA:    { label: 'Cancelada',    color: 'danger'  },
  DISPONIVEL:   { label: 'Disponivel',   color: 'success' },
  EM_CORRIDA:   { label: 'Em Corrida',   color: 'warning' },
};

