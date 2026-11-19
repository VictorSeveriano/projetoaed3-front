export const FORMA_PAGAMENTO_LABELS = Object.freeze({
  DINHEIRO:       'Dinheiro',
  CARTAO_DEBITO:  'Cartão Débito',
  CARTAO_CREDITO: 'Cartão Crédito',
  PIX:            'PIX',
});

export const ABAS_CORRIDA = Object.freeze([
  { key: 'TODAS',        label: 'Todas'        },
  { key: 'SOLICITADA',   label: 'Solicitadas'  },
  { key: 'CONFIRMADA',   label: 'Confirmadas'  },
  { key: 'EM_ANDAMENTO', label: 'Em andamento' },
  { key: 'FINALIZADA',   label: 'Concluídas'   },
  { key: 'CANCELADA',    label: 'Canceladas'   },
]);

export function resolverPapeisCorrida({
  podeCancelar = false,
  podeConfirmarPagamento = false,
  podeFinalizar = false,
  perfil = '',
} = {}) {
  const ehMotorista = perfil === 'MOTORISTA' || (podeConfirmarPagamento && !podeFinalizar);
  const ehAdmin = perfil === 'ADMINISTRADOR' || podeFinalizar;
  const ehPassageiro = perfil === 'USUARIO' || (podeCancelar && !podeConfirmarPagamento && !podeFinalizar);
  return { ehMotorista, ehAdmin, ehPassageiro };
}

/**
 * Regra pura que determina se o botão Cancelar deve ser exibido para a corrida e perfil atuais.
 */
export function podeExibirBotaoCancelar(
  corrida,
  { podeCancelar = false, podeConfirmarPagamento = false, podeFinalizar = false, perfil = '' } = {}
) {
  if (!corrida || !podeCancelar) return false;
  if (corrida.status === 'FINALIZADA' || corrida.status === 'CANCELADA' || corrida.status === 'EM_ANDAMENTO') {
    return false;
  }
  const { ehMotorista, ehAdmin } = resolverPapeisCorrida({
    podeCancelar,
    podeConfirmarPagamento,
    podeFinalizar,
    perfil,
  });
  if (ehMotorista) {
    return corrida.status === 'CONFIRMADA' && corrida.embarqueMotoristaConfirmado !== true;
  }
  if (ehAdmin) {
    return corrida.status === 'SOLICITADA' || corrida.status === 'CONFIRMADA';
  }
  return (corrida.status === 'SOLICITADA' || corrida.status === 'CONFIRMADA') && corrida.embarqueMotoristaConfirmado !== true;
}

/**
 * Centraliza todas as decisões de visibilidade de ações por corrida e perfil.
 */
export function obterAcoesDisponiveisCorrida(
  corrida,
  opcoes = {},
  agora = Date.now()
) {
  const {
    podeCancelar = false,
    podeFinalizar = false,
    podeConfirmarPagamento = false,
    perfil = '',
  } = opcoes;

  const { ehMotorista, ehPassageiro } = resolverPapeisCorrida(opcoes);
  const podeAcaoCancelar = podeExibirBotaoCancelar(corrida, {
    podeCancelar,
    podeConfirmarPagamento,
    podeFinalizar,
    perfil,
  });
  const podeAcaoFinalizar = Boolean(
    podeFinalizar && corrida && (corrida.status === 'CONFIRMADA' || corrida.status === 'EM_ANDAMENTO')
  );
  const podeAcaoConfirmarPagamento = Boolean(
    podeConfirmarPagamento && corrida && (corrida.status === 'EM_ANDAMENTO' || corrida.status === 'CONFIRMADA')
  );

  const horarioChegou = Boolean(corrida?.dataHorario && new Date(corrida.dataHorario).getTime() <= agora);
  const podeConfirmarEmbarqueMotorista = Boolean(
    podeConfirmarPagamento &&
    corrida?.status === 'CONFIRMADA' &&
    horarioChegou &&
    corrida?.embarqueMotoristaConfirmado !== true
  );
  const podeConfirmarEmbarquePassageiro = Boolean(
    ehPassageiro &&
    corrida &&
    (corrida.status === 'CONFIRMADA' || corrida.status === 'EM_ANDAMENTO') &&
    horarioChegou &&
    corrida.embarquePassageiroConfirmado == null
  );

  return {
    ehMotorista,
    ehPassageiro,
    podeAcaoCancelar,
    podeAcaoFinalizar,
    podeAcaoConfirmarPagamento,
    podeConfirmarEmbarque: podeConfirmarEmbarqueMotorista || podeConfirmarEmbarquePassageiro,
    podeConfirmarEmbarqueMotorista,
    podeConfirmarEmbarquePassageiro,
  };
}

export function filtrarCorridasPorAba(corridas = [], abaAtiva = 'TODAS') {
  if (abaAtiva === 'TODAS') return corridas;
  return corridas.filter((c) => c.status === abaAtiva);
}

export function contarCorridasPorAba(corridas = []) {
  const map = { TODAS: corridas.length };
  ABAS_CORRIDA.slice(1).forEach((a) => {
    map[a.key] = corridas.filter((c) => c.status === a.key).length;
  });
  return map;
}

export function descreverCancelamento(corrida) {
  if (!corrida || corrida.status !== 'CANCELADA' || (!corrida.motivoCancelamento && !corrida.canceladoPor)) {
    return '';
  }
  const autor =
    corrida.canceladoPor === 'MOTORISTA'
      ? 'Cancelada pelo motorista'
      : corrida.canceladoPor === 'PASSAGEIRO'
        ? 'Cancelada pelo passageiro'
        : corrida.canceladoPor === 'SISTEMA'
          ? 'Cancelada pelo sistema'
          : 'Cancelada';
  return `${autor}${corrida.motivoCancelamento ? `: ${corrida.motivoCancelamento}` : ''}`;
}
