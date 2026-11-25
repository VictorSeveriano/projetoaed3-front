import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOLERANCIA_ATRASO_MIN,
  FILTROS_CORRIDA_INICIAIS,
  MOTIVO_SEM_MOTORISTA,
  MOTIVO_AUSENCIA_CONFIRMACAO,
  foiExpiradaAutomaticamente,
  calcularDuracaoEfetivaMin,
  classificarPontualidadeCorrida,
  serializarFiltrosParaQuery,
  lerFiltrosDeSearchParams,
  listarChipsFiltrosAtivos,
  contarFiltrosAtivos,
} from '../src/utils/indicadorAtrasoCorrida.js';
import { construirParamsFiltroLimpos } from '../src/utils/downloadArquivo.js';

test('classificarPontualidadeCorrida mantém simetria com backend para todos os 7 estados temporais', () => {
  const agora = new Date('2026-11-25T16:00:00.000Z');
  const offset = (m) => new Date(agora.getTime() + m * 60000).toISOString();

  assert.equal(TOLERANCIA_ATRASO_MIN, 5);

  // 1. No horário (antes do agendado)
  const noHorario = classificarPontualidadeCorrida(
    { status: 'SOLICITADA', dataHorario: offset(15) },
    agora
  );
  assert.equal(noHorario.codigo, 'NO_HORARIO');
  assert.equal(noHorario.atrasada, false);

  // 2. Aguardando embarque (CONFIRMADA dentro dos 5 min de tolerância)
  const aguardando = classificarPontualidadeCorrida(
    { status: 'CONFIRMADA', dataHorario: offset(-4), embarqueMotoristaConfirmado: null },
    agora
  );
  assert.equal(aguardando.codigo, 'AGUARDANDO_EMBARQUE');
  assert.equal(aguardando.atrasada, false);

  // 3. Em atraso (ultrapassou tolerância sem embarque)
  const atrasada = classificarPontualidadeCorrida(
    { status: 'CONFIRMADA', dataHorario: offset(-9), embarqueMotoristaConfirmado: false },
    agora
  );
  assert.equal(atrasada.codigo, 'EM_ATRASO');
  assert.equal(atrasada.atrasada, true);
  assert.equal(atrasada.minutosAtraso, 9);

  // 4. Em andamento (nunca marcada como atrasada apenas por estar em andamento)
  const emAndamento = classificarPontualidadeCorrida(
    {
      status: 'EM_ANDAMENTO',
      dataHorario: offset(-30),
      embarqueMotoristaConfirmado: true,
      embarqueMotoristaEm: offset(-20),
    },
    agora
  );
  assert.equal(emAndamento.codigo, 'EM_ANDAMENTO');
  assert.equal(emAndamento.atrasada, false);
  assert.equal(emAndamento.iniciouComAtraso, true);

  // 5. Finalizada + duração efetiva
  const finalizada = classificarPontualidadeCorrida(
    {
      status: 'FINALIZADA',
      dataHorario: offset(-50),
      embarqueMotoristaConfirmado: true,
      embarqueMotoristaEm: offset(-48),
      finalizadaEm: offset(-25),
    },
    agora
  );
  assert.equal(finalizada.codigo, 'FINALIZADA');
  assert.equal(finalizada.duracaoEfetivaMin, 23);

  // 6. Cancelada manual vs 7. Expirada automática
  const canceladaManual = classificarPontualidadeCorrida(
    { status: 'CANCELADA', canceladoPor: 'PASSAGEIRO', motivoCancelamento: 'Imprevisto pessoal' },
    agora
  );
  assert.equal(canceladaManual.codigo, 'CANCELADA');
  assert.equal(canceladaManual.expirada, false);

  const expirada1 = classificarPontualidadeCorrida(
    { status: 'CANCELADA', canceladoPor: 'SISTEMA', motivoCancelamento: MOTIVO_SEM_MOTORISTA },
    agora
  );
  const expirada2 = classificarPontualidadeCorrida(
    { status: 'CANCELADA', canceladoPor: 'SISTEMA', motivoCancelamento: MOTIVO_AUSENCIA_CONFIRMACAO },
    agora
  );
  assert.equal(expirada1.codigo, 'EXPIRADA');
  assert.equal(expirada1.expirada, true);
  assert.equal(foiExpiradaAutomaticamente({ status: 'CANCELADA', canceladoPor: 'SISTEMA', motivoCancelamento: MOTIVO_AUSENCIA_CONFIRMACAO }), true);
  assert.equal(expirada2.codigo, 'EXPIRADA');
  assert.equal(calcularDuracaoEfetivaMin({ status: 'CANCELADA' }), null);
});

test('serializarFiltrosParaQuery, lerFiltrosDeSearchParams e chips preservam combinação e limpeza de filtros', () => {
  const filtrosCombinados = {
    ...FILTROS_CORRIDA_INICIAIS,
    id: '#f1e2d3',
    status: 'CANCELADA',
    dataInicio: '2026-11-01',
    dataFim: '2026-11-25',
    origem: 'UFES',
    destino: 'Centro',
    motorista: 'Carlos',
    veiculo: 'UCL1A23',
    canceladoPor: 'SISTEMA',
    expiradas: true,
  };

  assert.equal(contarFiltrosAtivos(filtrosCombinados), 10);
  const chips = listarChipsFiltrosAtivos(filtrosCombinados);
  assert.equal(chips.length, 10);
  assert.ok(chips.some((c) => c.chave === 'expiradas' && c.rotulo === 'Expiradas'));

  const params = serializarFiltrosParaQuery(filtrosCombinados, {
    escopo: 'HISTORICO',
    page: 2,
    ordenarPor: 'valor',
    direcao: 'asc',
  });
  assert.equal(params.get('escopo'), 'HISTORICO');
  assert.equal(params.get('status'), 'CANCELADA');
  assert.equal(params.get('expiradas'), 'true');
  assert.equal(params.get('atrasadas'), null);
  assert.equal(params.get('page'), '2');

  const recuperados = lerFiltrosDeSearchParams(params);
  assert.deepEqual(recuperados, filtrosCombinados);

  assert.equal(contarFiltrosAtivos(FILTROS_CORRIDA_INICIAIS), 0);
});

test('construirParamsFiltroLimpos mantém apenas filtros preenchidos para exportação de dashboard, veículos e usuários', () => {
  // Veículos: ignora campos vazios e envia exatamente porte, status e search filtrados
  const pVeiculos = construirParamsFiltroLimpos(
    { search: '  Corolla  ', status: 'DISPONIVEL', classe: '', porte: 'Medio' },
    { formato: 'csv' }
  );
  assert.equal(pVeiculos.toString(), 'search=Corolla&status=DISPONIVEL&porte=Medio&formato=csv');

  // Usuários: envia apenas perfil e search quando preenchidos
  const pUsuarios = construirParamsFiltroLimpos(
    { search: '', perfil: 'MOTORISTA' },
    { formato: 'pdf' }
  );
  assert.equal(pUsuarios.toString(), 'perfil=MOTORISTA&formato=pdf');

  // Dashboard: sem filtro envia apenas formato; com filtro envia período, status e classe
  const pDashLimpo = construirParamsFiltroLimpos(
    { dataInicio: '', dataFim: '', status: '', classe: '' },
    { formato: 'pdf' }
  );
  assert.equal(pDashLimpo.toString(), 'formato=pdf');

  const pDashFiltrado = construirParamsFiltroLimpos(
    { dataInicio: '2026-11-01', dataFim: '2026-11-30', status: 'FINALIZADA', classe: 'PREMIUM' },
    { formato: 'csv' }
  );
  assert.equal(
    pDashFiltrado.toString(),
    'dataInicio=2026-11-01&dataFim=2026-11-30&status=FINALIZADA&classe=PREMIUM&formato=csv'
  );
});
