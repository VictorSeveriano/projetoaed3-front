/**
 * indicadorAtrasoCorrida.js — Utilitário centralizado de classificação visual de
 * pontualidade/atraso, duração efetiva e serialização de filtros avançados de corridas.
 *
 * Mantém simetria estrita com `src/corridas/indicadorAtraso.js` da API:
 *  - Constante única `TOLERANCIA_ATRASO_MIN = 5` (minutos após `dataHorario`).
 *  - Não altera status da corrida nem prazos de expiração automática.
 *  - Distingue claramente `Em atraso` de `Expirada` e não marca `EM_ANDAMENTO` como atrasada.
 */

export const TOLERANCIA_ATRASO_MIN = 5;

export const MOTIVO_SEM_MOTORISTA =
  'Cancelada automaticamente pelo sistema: nenhum motorista aceitou a corrida até o horário agendado.';
export const MOTIVO_AUSENCIA_CONFIRMACAO =
  'Cancelada automaticamente pelo sistema: o prazo de confirmação de embarque expirou sem a confirmação necessária.';

export const FILTROS_CORRIDA_INICIAIS = Object.freeze({
  id: '',
  status: '',
  dataInicio: '',
  dataFim: '',
  origem: '',
  destino: '',
  motorista: '',
  passageiro: '',
  veiculo: '',
  canceladoPor: '',
  atrasadas: false,
  finalizadas: false,
  canceladas: false,
  expiradas: false,
});

export function foiExpiradaAutomaticamente(corrida) {
  if (!corrida || corrida.status !== 'CANCELADA') return false;
  if (corrida.canceladoPor !== 'SISTEMA') return false;
  const motivo = typeof corrida.motivoCancelamento === 'string'
    ? corrida.motivoCancelamento.trim()
    : '';
  if (!motivo) return false;
  return (
    motivo === MOTIVO_SEM_MOTORISTA ||
    motivo === MOTIVO_AUSENCIA_CONFIRMACAO ||
    /^cancelada automaticamente pelo sistema/i.test(motivo)
  );
}

export function calcularDuracaoEfetivaMin(corrida) {
  if (!corrida || !corrida.embarqueMotoristaEm || !corrida.finalizadaEm) {
    return null;
  }
  const inicioMs = new Date(corrida.embarqueMotoristaEm).getTime();
  const fimMs = new Date(corrida.finalizadaEm).getTime();
  if (Number.isNaN(inicioMs) || Number.isNaN(fimMs) || fimMs < inicioMs) {
    return null;
  }
  return Math.max(0, Math.round((fimMs - inicioMs) / 60000));
}

export function classificarPontualidadeCorrida(
  corrida,
  agora = new Date(),
  toleranciaMin = TOLERANCIA_ATRASO_MIN
) {
  const duracaoEfetivaMin =
    corrida?.duracaoEfetivaMin !== undefined && corrida?.duracaoEfetivaMin !== null
      ? corrida.duracaoEfetivaMin
      : calcularDuracaoEfetivaMin(corrida);

  const agendadoMs = corrida?.dataHorario ? new Date(corrida.dataHorario).getTime() : NaN;
  const embarqueMs =
    corrida?.embarqueMotoristaConfirmado === true && corrida?.embarqueMotoristaEm
      ? new Date(corrida.embarqueMotoristaEm).getTime()
      : NaN;

  let iniciouComAtraso = false;
  let atrasoInicioMinutos = 0;
  if (!Number.isNaN(agendadoMs) && !Number.isNaN(embarqueMs) && embarqueMs > agendadoMs) {
    const diffInicio = Math.floor((embarqueMs - agendadoMs) / 60000);
    if (diffInicio > toleranciaMin) {
      iniciouComAtraso = true;
      atrasoInicioMinutos = diffInicio;
    }
  }

  const base = {
    toleranciaMin,
    duracaoEfetivaMin,
    iniciouComAtraso,
    atrasoInicioMinutos,
  };

  if (!corrida) {
    return {
      ...base,
      codigo: 'NO_HORARIO',
      rotulo: 'No horário',
      cor: 'muted',
      atrasada: false,
      expirada: false,
      minutosAtraso: 0,
    };
  }

  if (corrida.status === 'FINALIZADA') {
    return {
      ...base,
      codigo: 'FINALIZADA',
      rotulo: 'Finalizada',
      cor: 'success',
      atrasada: false,
      expirada: false,
      minutosAtraso: 0,
    };
  }

  if (corrida.status === 'CANCELADA') {
    if (foiExpiradaAutomaticamente(corrida)) {
      return {
        ...base,
        codigo: 'EXPIRADA',
        rotulo: 'Expirada',
        cor: 'muted',
        atrasada: false,
        expirada: true,
        minutosAtraso: 0,
      };
    }
    return {
      ...base,
      codigo: 'CANCELADA',
      rotulo: 'Cancelada',
      cor: 'danger',
      atrasada: false,
      expirada: false,
      minutosAtraso: 0,
    };
  }

  if (corrida.status === 'EM_ANDAMENTO') {
    return {
      ...base,
      codigo: 'EM_ANDAMENTO',
      rotulo: 'Em andamento',
      cor: 'warning',
      atrasada: false,
      expirada: false,
      minutosAtraso: 0,
    };
  }

  const agoraMs = agora instanceof Date ? agora.getTime() : new Date(agora).getTime();
  if (Number.isNaN(agendadoMs) || Number.isNaN(agoraMs) || agoraMs < agendadoMs) {
    return {
      ...base,
      codigo: 'NO_HORARIO',
      rotulo: 'No horário',
      cor: 'success',
      atrasada: false,
      expirada: false,
      minutosAtraso: 0,
    };
  }

  const limiteToleranciaMs = agendadoMs + toleranciaMin * 60 * 1000;
  const minutosPassados = Math.max(0, Math.floor((agoraMs - agendadoMs) / 60000));

  if (agoraMs <= limiteToleranciaMs) {
    if (corrida.status === 'CONFIRMADA' && corrida.embarqueMotoristaConfirmado !== true) {
      return {
        ...base,
        codigo: 'AGUARDANDO_EMBARQUE',
        rotulo: 'Aguardando embarque',
        cor: 'info',
        atrasada: false,
        expirada: false,
        minutosAtraso: minutosPassados,
      };
    }
    return {
      ...base,
      codigo: 'NO_HORARIO',
      rotulo: 'No horário',
      cor: 'info',
      atrasada: false,
      expirada: false,
      minutosAtraso: 0,
    };
  }

  return {
    ...base,
    codigo: 'EM_ATRASO',
    rotulo: 'Em atraso',
    cor: 'danger',
    atrasada: true,
    expirada: false,
    minutosAtraso: Math.max(1, minutosPassados),
  };
}

export function serializarFiltrosParaQuery(filtros = {}, extras = {}) {
  const params = new URLSearchParams();
  const combinado = { ...filtros, ...extras };

  const chavesTexto = [
    'escopo',
    'id',
    'status',
    'dataInicio',
    'dataFim',
    'origem',
    'destino',
    'motorista',
    'passageiro',
    'veiculo',
    'canceladoPor',
    'ordenarPor',
    'direcao',
  ];

  for (const chave of chavesTexto) {
    const val = combinado[chave];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      params.set(chave, String(val).trim());
    }
  }

  const chavesBool = ['atrasadas', 'finalizadas', 'canceladas', 'expiradas'];
  for (const chave of chavesBool) {
    if (combinado[chave] === true || combinado[chave] === 'true') {
      params.set(chave, 'true');
    }
  }

  if (combinado.page !== undefined && combinado.page !== null && Number(combinado.page) >= 1) {
    params.set('page', String(combinado.page));
  }
  if (combinado.limit !== undefined && combinado.limit !== null && Number(combinado.limit) >= 1) {
    params.set('limit', String(combinado.limit));
  }
  if (combinado.formato) {
    params.set('formato', String(combinado.formato));
  }

  return params;
}

export function lerFiltrosDeSearchParams(searchParams) {
  if (!searchParams) return { ...FILTROS_CORRIDA_INICIAIS };
  return {
    id: searchParams.get('id') || '',
    status: searchParams.get('status') || '',
    dataInicio: searchParams.get('dataInicio') || '',
    dataFim: searchParams.get('dataFim') || '',
    origem: searchParams.get('origem') || '',
    destino: searchParams.get('destino') || '',
    motorista: searchParams.get('motorista') || '',
    passageiro: searchParams.get('passageiro') || '',
    veiculo: searchParams.get('veiculo') || '',
    canceladoPor: searchParams.get('canceladoPor') || '',
    atrasadas: searchParams.get('atrasadas') === 'true',
    finalizadas: searchParams.get('finalizadas') === 'true',
    canceladas: searchParams.get('canceladas') === 'true',
    expiradas: searchParams.get('expiradas') === 'true',
  };
}

const LABELS_STATUS = {
  SOLICITADA: 'Solicitada',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

const LABELS_CANCELADO_POR = {
  MOTORISTA: 'Motorista',
  PASSAGEIRO: 'Passageiro',
  SISTEMA: 'Sistema',
};

export function listarChipsFiltrosAtivos(filtros = {}) {
  const chips = [];
  if (filtros.id) chips.push({ chave: 'id', rotulo: `ID: ${filtros.id}` });
  if (filtros.status) {
    chips.push({ chave: 'status', rotulo: `Status: ${LABELS_STATUS[filtros.status] || filtros.status}` });
  }
  if (filtros.dataInicio) chips.push({ chave: 'dataInicio', rotulo: `De: ${filtros.dataInicio}` });
  if (filtros.dataFim) chips.push({ chave: 'dataFim', rotulo: `Até: ${filtros.dataFim}` });
  if (filtros.origem) chips.push({ chave: 'origem', rotulo: `Origem: ${filtros.origem}` });
  if (filtros.destino) chips.push({ chave: 'destino', rotulo: `Destino: ${filtros.destino}` });
  if (filtros.motorista) chips.push({ chave: 'motorista', rotulo: `Motorista: ${filtros.motorista}` });
  if (filtros.passageiro) chips.push({ chave: 'passageiro', rotulo: `Passageiro: ${filtros.passageiro}` });
  if (filtros.veiculo) chips.push({ chave: 'veiculo', rotulo: `Veículo: ${filtros.veiculo}` });
  if (filtros.canceladoPor) {
    chips.push({
      chave: 'canceladoPor',
      rotulo: `Cancelado por: ${LABELS_CANCELADO_POR[filtros.canceladoPor] || filtros.canceladoPor}`,
    });
  }
  if (filtros.atrasadas) chips.push({ chave: 'atrasadas', rotulo: 'Em atraso' });
  if (filtros.finalizadas) chips.push({ chave: 'finalizadas', rotulo: 'Finalizadas' });
  if (filtros.canceladas) chips.push({ chave: 'canceladas', rotulo: 'Canceladas' });
  if (filtros.expiradas) chips.push({ chave: 'expiradas', rotulo: 'Expiradas' });
  return chips;
}

export function contarFiltrosAtivos(filtros = {}) {
  return listarChipsFiltrosAtivos(filtros).length;
}
