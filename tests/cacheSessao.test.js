import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { criarCacheSessao } from '../src/services/cacheSessao.js';

describe('CacheSessao — isolamento por token, deduplicação e invalidação', () => {
  it('coalesces chamadas simultâneas e reutiliza valor dentro do TTL', async () => {
    let token = 'token-user-a';
    let chamadas = 0;
    const cache = criarCacheSessao({ obterToken: () => token });

    const carregador = () => new Promise((resolve) => {
      chamadas += 1;
      setTimeout(() => resolve({ ok: chamadas }), 15);
    });

    const [r1, r2] = await Promise.all([
      cache.obterOuCarregar('dashboard:completo', 5000, carregador),
      cache.obterOuCarregar('dashboard:completo', 5000, carregador),
    ]);

    assert.deepEqual(r1, { ok: 1 });
    assert.deepEqual(r2, { ok: 1 });
    assert.equal(chamadas, 1);

    const r3 = await cache.obterOuCarregar('dashboard:completo', 5000, carregador);
    assert.deepEqual(r3, { ok: 1 });
    assert.equal(chamadas, 1);
  });

  it('isola completamente dados em cache ao trocar de sessão/token', async () => {
    let token = 'token-user-a';
    const cache = criarCacheSessao({ obterToken: () => token });

    const dadosA = await cache.obterOuCarregar('corridas:perfil:', 5000, async () => ['corrida-a']);
    assert.deepEqual(dadosA, ['corrida-a']);

    // Troca de usuário (novo token) não pode receber dados em cache do usuário anterior
    token = 'token-user-b';
    const dadosB = await cache.obterOuCarregar('corridas:perfil:', 5000, async () => ['corrida-b']);
    assert.deepEqual(dadosB, ['corrida-b']);
  });

  it('invalida corretamente por prefixo e impede gravação de resposta antiga após invalidação', async () => {
    const token = 'token-user-a';
    const cache = criarCacheSessao({ obterToken: () => token });

    let resolverAntigo;
    const pAntiga = cache.obterOuCarregar(
      'notificacoes:resumo',
      5000,
      () => new Promise((resolve) => { resolverAntigo = resolve; })
    );

    await Promise.resolve();
    cache.invalidarPrefixo('notificacoes:');
    resolverAntigo({ naoLidas: 5 });
    await pAntiga;

    const novo = await cache.obterOuCarregar('notificacoes:resumo', 5000, async () => ({ naoLidas: 0 }));
    assert.deepEqual(novo, { naoLidas: 0 });
  });

  it('forcar: true ignora cache vigente e busca dados atualizados', async () => {
    const cache = criarCacheSessao({ obterToken: () => 't1' });
    let seq = 0;

    const a = await cache.obterOuCarregar('veiculos:lista:', 5000, async () => ++seq);
    const b = await cache.obterOuCarregar('veiculos:lista:', 5000, async () => ++seq);
    const c = await cache.obterOuCarregar('veiculos:lista:', 5000, async () => ++seq, { forcar: true });

    assert.equal(a, 1);
    assert.equal(b, 1);
    assert.equal(c, 2);
  });
});
