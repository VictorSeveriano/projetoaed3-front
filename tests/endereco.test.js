import test from 'node:test';
import assert from 'node:assert/strict';

import { ENDERECO_VAZIO, isAddressDifferent } from '../src/utils/endereco.js';

test('isAddressDifferent trata null, undefined e string vazia como equivalentes', () => {
  assert.equal(isAddressDifferent(null, ENDERECO_VAZIO), false);
  assert.equal(isAddressDifferent(undefined, {}), false);
  assert.equal(isAddressDifferent({ rua: null, cep: undefined }, ENDERECO_VAZIO), false);
});

test('isAddressDifferent detecta alteração em qualquer campo do endereço', () => {
  const base = { rua: 'Rua A', bairro: 'Centro', cidade: 'Vitória', estado: 'ES', numero: '10', cep: '29000-000' };
  assert.equal(isAddressDifferent(base, { ...base }), false);
  for (const campo of Object.keys(base)) {
    assert.equal(isAddressDifferent(base, { ...base, [campo]: 'outro' }), true, `campo ${campo}`);
  }
});

