import test from 'node:test';
import assert from 'node:assert/strict';

import { classificarNotificacaoVisual } from '../src/utils/notificacaoVisual.js';

test('classificarNotificacaoVisual identifica categorias e cores por tipo e contexto', () => {
  assert.deepEqual(classificarNotificacaoVisual({ tipo: 'NOVA_CORRIDA' }), {
    categoria: 'Nova corrida',
    cor: 'warning',
    icone: 'car',
  });

  assert.deepEqual(classificarNotificacaoVisual({ tipo: 'SOLICITACAO_MOTORISTA' }), {
    categoria: 'Solicitação de motorista',
    cor: 'info',
    icone: 'user',
  });

  assert.deepEqual(classificarNotificacaoVisual({ tipo: 'SOLICITACAO_VEICULO' }), {
    categoria: 'Análise de veículo',
    cor: 'info',
    icone: 'shield',
  });

  assert.deepEqual(classificarNotificacaoVisual({ tipo: 'CADASTRO_APROVADO' }), {
    categoria: 'Cadastro aprovado',
    cor: 'success',
    icone: 'check',
  });

  assert.deepEqual(
    classificarNotificacaoVisual({
      tipo: 'ATUALIZACAO_CORRIDA',
      titulo: 'Corrida cancelada',
      mensagem: 'O passageiro cancelou a viagem.',
    }),
    { categoria: 'Cancelamento', cor: 'danger', icone: 'cancel' }
  );

  assert.deepEqual(
    classificarNotificacaoVisual({
      tipo: 'ATUALIZACAO_CORRIDA',
      titulo: 'Motorista a caminho',
      mensagem: 'Carlos informou que está a caminho.',
    }),
    { categoria: 'Embarque', cor: 'warning', icone: 'navigation' }
  );

  assert.deepEqual(
    classificarNotificacaoVisual({
      tipo: 'ATUALIZACAO_CORRIDA',
      titulo: 'Corrida finalizada',
      mensagem: 'Pagamento confirmado.',
    }),
    { categoria: 'Concluída', cor: 'success', icone: 'check' }
  );

  assert.deepEqual(classificarNotificacaoVisual({ tipo: 'DESCONHECIDO' }), {
    categoria: 'Sistema',
    cor: 'muted',
    icone: 'bell',
  });
});
