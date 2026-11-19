export const MOTIVO_MIN = 5;
export const MOTIVO_MAX = 500;
export const ADIAR_AO_FECHAR_MS = 2 * 60 * 1000;
export const REABRIR_A_CAMINHO_ANTES_MS = 5 * 60 * 1000;

/** Valida o motivo (trim, mínimo e máximo) — espelha a validação do backend. */
export function validarMotivo(motivo) {
  const limpo = (motivo || '').trim();
  if (!limpo) return 'Informe o motivo.';
  if (limpo.length < MOTIVO_MIN) return `O motivo deve ter ao menos ${MOTIVO_MIN} caracteres.`;
  if (limpo.length > MOTIVO_MAX) return `O motivo deve ter no máximo ${MOTIVO_MAX} caracteres.`;
  return '';
}

/** Decide se a corrida precisa de confirmação de embarque do perfil informado, no instante `agora`. */
export function precisaConfirmacao(corrida, perfil, agora = Date.now()) {
  if (!corrida) return false;
  const horario = new Date(corrida.dataHorario).getTime();
  if (Number.isNaN(horario) || horario > agora) return false;

  if (perfil === 'MOTORISTA') {
    if (corrida.status !== 'CONFIRMADA' || corrida.embarqueMotoristaConfirmado === true) return false;
    if (corrida.situacaoMotorista === 'A_CAMINHO') {
      const prazo = corrida.prazoConfirmacaoEm ? new Date(corrida.prazoConfirmacaoEm).getTime() : 0;
      return prazo > 0 && prazo - agora <= REABRIR_A_CAMINHO_ANTES_MS;
    }
    return true;
  }

  if (perfil === 'USUARIO') {
    if (!['CONFIRMADA', 'EM_ANDAMENTO'].includes(corrida.status)) return false;
    return corrida.embarquePassageiroConfirmado == null;
  }

  return false;
}

/**
 * Seleciona a próxima corrida elegível para confirmação na fila (uma por vez,
 * ordenada pelo horário agendado e respeitando adiamentos temporários).
 */
export function obterProximaCorridaParaConfirmacao(corridas = [], perfil, agora = Date.now(), adiadasMap = null) {
  const fila = (Array.isArray(corridas) ? corridas : [])
    .filter((c) => precisaConfirmacao(c, perfil, agora))
    .filter((c) => !adiadasMap || (adiadasMap.get(c.id) || 0) <= agora)
    .sort((a, b) => new Date(a.dataHorario) - new Date(b.dataHorario));
  return fila[0] || null;
}

/** Valida o motivo e monta o payload de cancelamento no fluxo de embarque. */
export function montarPayloadCancelamentoEmbarque(ehMotorista, motivo) {
  const erro = validarMotivo(motivo);
  if (erro) return { erro, payload: null };

  const motivoLimpo = motivo.trim();
  const payload = ehMotorista
    ? { acao: 'NAO_VOU_EMBARCAR', motivo: motivoLimpo }
    : { acao: 'NAO_EMBARQUEI', cancelarViagem: true, motivo: motivoLimpo };

  return { erro: '', payload };
}

export function extrairMensagemErroApi(err, mensagemPadrao) {
  return err?.response?.data?.message || mensagemPadrao;
}
