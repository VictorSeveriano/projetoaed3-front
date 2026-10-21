/**
 * modalStack.test.js — Testes unitários para o módulo modalStack.
 *
 * Cobertura:
 *   - Abertura de um único modal
 *   - Empilhamento de múltiplos modais
 *   - Fechamento do modal do topo
 *   - Fechamento de modal intermediário (não corrompe o topo)
 *   - hasOpenModals e getStackSize
 *   - Desmontagem sem registros residuais
 *
 * Nota: o comportamento de Escape e scroll do body depende de APIs do navegador
 * (window, document) e não pode ser testado neste ambiente Node.js sem JSDOM.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pushModal,
  popModal,
  isTopModal,
  hasOpenModals,
  getStackSize,
  _resetStack,
} from '../src/utils/modalStack.js';

// ─── Helper: garante pilha limpa antes de cada teste ──────────────────────────
function beforeEach() { _resetStack(); }

// ─── Testes ───────────────────────────────────────────────────────────────────

test('pilha começa vazia', () => {
  beforeEach();
  assert.equal(getStackSize(), 0);
  assert.equal(hasOpenModals(), false);
});

test('pushModal retorna string não vazia', () => {
  beforeEach();
  const id = pushModal();
  assert.equal(typeof id, 'string');
  assert.ok(id.length > 0);
});

test('cada pushModal retorna ID único', () => {
  beforeEach();
  const ids = new Set([pushModal(), pushModal(), pushModal()]);
  assert.equal(ids.size, 3);
});

test('getStackSize incrementa a cada pushModal', () => {
  beforeEach();
  assert.equal(getStackSize(), 0);
  pushModal();
  assert.equal(getStackSize(), 1);
  pushModal();
  assert.equal(getStackSize(), 2);
});

test('hasOpenModals retorna true depois do primeiro push', () => {
  beforeEach();
  assert.equal(hasOpenModals(), false);
  pushModal();
  assert.equal(hasOpenModals(), true);
});

test('isTopModal retorna true somente para o último modal empilhado', () => {
  beforeEach();
  const idA = pushModal();
  const idB = pushModal();
  assert.equal(isTopModal(idA), false, 'A não é o topo quando B está aberto');
  assert.equal(isTopModal(idB), true,  'B é o topo');
});

test('popModal do topo restaura o modal anterior como topo', () => {
  beforeEach();
  const idA = pushModal();
  const idB = pushModal();
  popModal(idB);
  assert.equal(isTopModal(idA), true,  'A deve ser o topo após fechar B');
  assert.equal(isTopModal(idB), false, 'B não deve mais existir na pilha');
  assert.equal(getStackSize(), 1);
});

test('popModal de modal intermediário não corrompe o topo', () => {
  beforeEach();
  const idA = pushModal(); // nível 1
  const idB = pushModal(); // nível 2
  const idC = pushModal(); // nível 3 (topo)

  // Fecha B (modal intermediário)
  popModal(idB);

  assert.equal(getStackSize(), 2);
  assert.equal(isTopModal(idC), true,  'C ainda é o topo após fechar B');
  assert.equal(isTopModal(idA), false, 'A não é o topo');
  assert.equal(isTopModal(idB), false, 'B não existe mais na pilha');
});

test('popModal com ID inexistente não altera a pilha', () => {
  beforeEach();
  const idA = pushModal();
  popModal('id-invalido-que-nao-existe');
  assert.equal(getStackSize(), 1);
  assert.equal(isTopModal(idA), true);
});

test('pilha fica vazia após fechar todos os modais', () => {
  beforeEach();
  const idA = pushModal();
  const idB = pushModal();
  popModal(idA);
  popModal(idB);
  assert.equal(getStackSize(), 0);
  assert.equal(hasOpenModals(), false);
});

test('_resetStack limpa a pilha completamente', () => {
  beforeEach();
  pushModal();
  pushModal();
  _resetStack();
  assert.equal(getStackSize(), 0);
  assert.equal(hasOpenModals(), false);
});

test('pilha funciona corretamente após reset e reutilização', () => {
  beforeEach();
  pushModal();
  _resetStack();
  const id = pushModal();
  assert.equal(getStackSize(), 1);
  assert.equal(isTopModal(id), true);
});

