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

export const formatarCPF = (v) => {
  if (!v) return '';
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9, 11)}`;
};

export const formatarCelular = (v) => {
  if (!v) return '';
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
};

export const formatarCEP = (v) => {
  if (!v) return '';
  v = v.replace(/\D/g, '').slice(0, 8);
  if (v.length <= 5) return v;
  return `${v.slice(0, 5)}-${v.slice(5)}`;
};
