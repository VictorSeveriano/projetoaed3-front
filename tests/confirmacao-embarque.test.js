import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADIAR_AO_FECHAR_MS,
  validarMotivo,
  precisaConfirmacao,
  obterProximaCorridaParaConfirmacao,
  montarPayloadCancelamentoEmbarque,
  extrairMensagemErroApi,
} from '../src/utils/confirmacaoEmbarque.js';
import {
  podeExibirBotaoCancelar,
  obterAcoesDisponiveisCorrida,
  filtrarCorridasPorAba,
  contarCorridasPorAba,
  descreverCancelamento,
} from '../src/components/ui/corridas/corridaPermissoes.js';

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

  const aCaminhoLonge = {
    ...vencida,
    situacaoMotorista: 'A_CAMINHO',
    prazoConfirmacaoEm: new Date(agora + 14 * 60000).toISOString(),
  };
  assert.equal(precisaConfirmacao(aCaminhoLonge, 'MOTORISTA', agora), false);

  const aCaminhoPerto = {
    ...vencida,
    situacaoMotorista: 'A_CAMINHO',
    prazoConfirmacaoEm: new Date(agora + 3 * 60000).toISOString(),
  };
  assert.equal(precisaConfirmacao(aCaminhoPerto, 'MOTORISTA', agora), true);
});

test('obterProximaCorridaParaConfirmacao ordena por dataHorario, adia ao fechar e reabre após prazo de adiamento', () => {
  const agora = Date.now();
  const cMaisRecente = {
    id: 'c-2',
    status: 'CONFIRMADA',
    dataHorario: new Date(agora - 30000).toISOString(),
  };
  const cMaisAntiga = {
    id: 'c-1',
    status: 'CONFIRMADA',
    dataHorario: new Date(agora - 120000).toISOString(),
  };
  const adiadas = new Map();

  const primeira = obterProximaCorridaParaConfirmacao([cMaisRecente, cMaisAntiga], 'MOTORISTA', agora, adiadas);
  assert.equal(primeira.id, 'c-1');

  // Adia c-1 ao fechar o modal -> próxima da fila passa a ser c-2
  adiadas.set('c-1', agora + ADIAR_AO_FECHAR_MS);
  const segunda = obterProximaCorridaParaConfirmacao([cMaisRecente, cMaisAntiga], 'MOTORISTA', agora + 1000, adiadas);
  assert.equal(segunda.id, 'c-2');

  // Após vencer ADIAR_AO_FECHAR_MS, c-1 volta a ser priorizada para reabertura
  const reaberta = obterProximaCorridaParaConfirmacao(
    [cMaisRecente, cMaisAntiga],
    'MOTORISTA',
    agora + ADIAR_AO_FECHAR_MS + 1,
    adiadas
  );
  assert.equal(reaberta.id, 'c-1');
});

test('montarPayloadCancelamentoEmbarque e extrairMensagemErroApi espelham decisões por perfil e erros da API', () => {
  const invalido = montarPayloadCancelamentoEmbarque(true, 'abc');
  assert.notEqual(invalido.erro, '');
  assert.equal(invalido.payload, null);

  const motoristaOk = montarPayloadCancelamentoEmbarque(true, '  Pneu furado  ');
  assert.deepEqual(motoristaOk, {
    erro: '',
    payload: { acao: 'NAO_VOU_EMBARCAR', motivo: 'Pneu furado' },
  });

  const passageiroOk = montarPayloadCancelamentoEmbarque(false, '  Atraso excessivo  ');
  assert.deepEqual(passageiroOk, {
    erro: '',
    payload: { acao: 'NAO_EMBARQUEI', cancelarViagem: true, motivo: 'Atraso excessivo' },
  });

  assert.equal(
    extrairMensagemErroApi({ response: { data: { message: 'Conflito de estado' } } }, 'Fallback'),
    'Conflito de estado'
  );
  assert.equal(extrairMensagemErroApi(new Error('network'), 'Fallback'), 'Fallback');
});

test('podeExibirBotaoCancelar exibe botão Cancelar para motorista apenas em corridas CONFIRMADA sem embarque', () => {
  const propsMotorista = { podeCancelar: true, podeConfirmarPagamento: true, perfil: 'MOTORISTA' };

  assert.equal(podeExibirBotaoCancelar({ status: 'CONFIRMADA', embarqueMotoristaConfirmado: null }, propsMotorista), true);
  assert.equal(podeExibirBotaoCancelar({ status: 'SOLICITADA' }, propsMotorista), false);
  assert.equal(podeExibirBotaoCancelar({ status: 'EM_ANDAMENTO', embarqueMotoristaConfirmado: true }, propsMotorista), false);
  assert.equal(podeExibirBotaoCancelar({ status: 'FINALIZADA' }, propsMotorista), false);
  assert.equal(podeExibirBotaoCancelar({ status: 'CANCELADA' }, propsMotorista), false);
});

test('podeExibirBotaoCancelar exibe botão Cancelar para passageiro em SOLICITADA e CONFIRMADA e oculta em FINALIZADA/CANCELADA/EM_ANDAMENTO', () => {
  const propsPassageiro = { podeCancelar: true, perfil: 'USUARIO' };

  assert.equal(podeExibirBotaoCancelar({ status: 'SOLICITADA' }, propsPassageiro), true);
  assert.equal(podeExibirBotaoCancelar({ status: 'CONFIRMADA', embarqueMotoristaConfirmado: null }, propsPassageiro), true);
  assert.equal(podeExibirBotaoCancelar({ status: 'EM_ANDAMENTO', embarqueMotoristaConfirmado: true }, propsPassageiro), false);
  assert.equal(podeExibirBotaoCancelar({ status: 'FINALIZADA' }, propsPassageiro), false);
  assert.equal(podeExibirBotaoCancelar({ status: 'CANCELADA' }, propsPassageiro), false);
});

test('obterAcoesDisponiveisCorrida separa corretamente ações de motorista, passageiro e administrador', () => {
  const agora = Date.now();
  const corridaConfirmada = {
    status: 'CONFIRMADA',
    dataHorario: new Date(agora - 60000).toISOString(),
    embarqueMotoristaConfirmado: null,
    embarquePassageiroConfirmado: null,
  };

  const acoesPassageiro = obterAcoesDisponiveisCorrida(
    corridaConfirmada,
    { podeCancelar: true, perfil: 'USUARIO' },
    agora
  );
  assert.equal(acoesPassageiro.ehPassageiro, true);
  assert.equal(acoesPassageiro.podeConfirmarEmbarquePassageiro, true);
  assert.equal(acoesPassageiro.podeConfirmarEmbarqueMotorista, false);
  assert.equal(acoesPassageiro.podeAcaoCancelar, true);
  assert.equal(acoesPassageiro.podeAcaoFinalizar, false);
  assert.equal(acoesPassageiro.podeAcaoConfirmarPagamento, false);

  const acoesMotorista = obterAcoesDisponiveisCorrida(
    corridaConfirmada,
    { podeCancelar: true, podeConfirmarPagamento: true, perfil: 'MOTORISTA' },
    agora
  );
  assert.equal(acoesMotorista.ehMotorista, true);
  assert.equal(acoesMotorista.podeConfirmarEmbarqueMotorista, true);
  assert.equal(acoesMotorista.podeConfirmarEmbarquePassageiro, false);
  assert.equal(acoesMotorista.podeAcaoConfirmarPagamento, true);
  assert.equal(acoesMotorista.podeAcaoFinalizar, false);

  const acoesAdminConfirmada = obterAcoesDisponiveisCorrida(
    corridaConfirmada,
    { podeCancelar: true, podeFinalizar: true, perfil: 'ADMINISTRADOR' },
    agora
  );
  assert.equal(acoesAdminConfirmada.podeAcaoFinalizar, true);
  assert.equal(acoesAdminConfirmada.podeAcaoCancelar, true);
  assert.equal(acoesAdminConfirmada.podeConfirmarEmbarque, false);

  const acoesAdminEmAndamento = obterAcoesDisponiveisCorrida(
    { ...corridaConfirmada, status: 'EM_ANDAMENTO' },
    { podeCancelar: true, podeFinalizar: true, perfil: 'ADMINISTRADOR' },
    agora
  );
  assert.equal(acoesAdminEmAndamento.podeAcaoFinalizar, true);
  assert.equal(acoesAdminEmAndamento.podeAcaoCancelar, false);
  assert.equal(acoesAdminEmAndamento.podeConfirmarEmbarque, false);
});

test('filtrarCorridasPorAba, contarCorridasPorAba e descreverCancelamento preservam contadores e rótulos', () => {
  const lista = [
    { id: '1', status: 'SOLICITADA' },
    { id: '2', status: 'CONFIRMADA' },
    { id: '3', status: 'EM_ANDAMENTO' },
    { id: '4', status: 'FINALIZADA' },
    { id: '5', status: 'CANCELADA', canceladoPor: 'SISTEMA', motivoCancelamento: 'Expirada' },
  ];

  assert.deepEqual(contarCorridasPorAba(lista), {
    TODAS: 5,
    SOLICITADA: 1,
    CONFIRMADA: 1,
    EM_ANDAMENTO: 1,
    FINALIZADA: 1,
    CANCELADA: 1,
  });
  assert.equal(filtrarCorridasPorAba(lista, 'TODAS').length, 5);
  assert.deepEqual(filtrarCorridasPorAba(lista, 'CONFIRMADA').map((c) => c.id), ['2']);
  assert.equal(descreverCancelamento(lista[4]), 'Cancelada pelo sistema: Expirada');
  assert.equal(descreverCancelamento(lista[0]), '');
});
