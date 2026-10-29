import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Testes unitários das regras puras de elegibilidade da fila de modais e validação
 * de motivo de cancelamento no frontend.
 */

const MOTIVO_MIN = 5;
const MOTIVO_MAX = 500;
const REABRIR_A_CAMINHO_ANTES_MS = 5 * 60 * 1000;

function validarMotivo(motivo) {
  const limpo = (motivo || '').trim();
  if (!limpo) return 'Informe o motivo.';
  if (limpo.length < MOTIVO_MIN) return `O motivo deve ter ao menos ${MOTIVO_MIN} caracteres.`;
  if (limpo.length > MOTIVO_MAX) return `O motivo deve ter no máximo ${MOTIVO_MAX} caracteres.`;
  return '';
}

function precisaConfirmacao(corrida, perfil, agora) {
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

test('validarMotivo rejeita vazio, apenas espaços, curto demais ou acima do limite', () => {
  assert.notEqual(validarMotivo(''), '');
  assert.notEqual(validarMotivo('     '), '');
  assert.notEqual(validarMotivo('abc'), '');
  assert.notEqual(validarMotivo('x'.repeat(501)), '');
  assert.equal(validarMotivo('  Motivo válido de cancelamento  '), '');
});

test('precisaConfirmacao só habilita modal a partir do horário agendado e respeita situação A_CAMINHO', () => {
  const agora = Date.now();
  const futura = { id: '1', status: 'CONFIRMADA', dataHorario: new Date(agora + 600000).toISOString() };
  const vencida = { id: '2', status: 'CONFIRMADA', dataHorario: new Date(agora - 60000).toISOString() };

  assert.equal(precisaConfirmacao(futura, 'MOTORISTA', agora), false);
  assert.equal(precisaConfirmacao(futura, 'USUARIO', agora), false);
  assert.equal(precisaConfirmacao(vencida, 'MOTORISTA', agora), true);
  assert.equal(precisaConfirmacao(vencida, 'USUARIO', agora), true);

  // Motorista informou "Estou a caminho" com 15 min restantes -> não reabre imediatamente
  const aCaminhoLonge = {
    ...vencida,
    situacaoMotorista: 'A_CAMINHO',
    prazoConfirmacaoEm: new Date(agora + 14 * 60000).toISOString(),
  };
  assert.equal(precisaConfirmacao(aCaminhoLonge, 'MOTORISTA', agora), false);

  // Quando faltam menos de 5 min do prazo estendido -> reabre para decisão final
  const aCaminhoPerto = {
    ...vencida,
    situacaoMotorista: 'A_CAMINHO',
    prazoConfirmacaoEm: new Date(agora + 3 * 60000).toISOString(),
  };
  assert.equal(precisaConfirmacao(aCaminhoPerto, 'MOTORISTA', agora), true);
});

