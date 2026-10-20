import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatarData,
  formatarDataHorario,
  formatarMoeda,
  formatarCPF,
  formatarCelular,
  formatarCEP,
} from '../src/utils/formatters.js';

import {
  validarCPF,
  validarCNH,
  validarCelular,
  validarCEP,
  validarSenha,
} from '../src/utils/validators.js';

test('formatarData e formatarDataHorario tratam valores vazios e datas ISO no fuso comercial', () => {
  assert.equal(formatarData(null), '—');
  assert.equal(formatarData('invalido'), '—');
  assert.equal(formatarData('2026-10-20'), '20/10/2026');

  assert.equal(formatarDataHorario(undefined), '—');
  assert.equal(formatarDataHorario('invalido'), '—');
  assert.match(formatarDataHorario('2026-10-20T18:30:00.000Z'), /20\/10\/2026.*15:30/);
});

test('formatarMoeda, formatarCPF, formatarCelular e formatarCEP aplicam mascaras corretamente', () => {
  assert.match(formatarMoeda(42.5), /42,50/);
  assert.equal(formatarCPF('12345678901'), '123.456.789-01');
  assert.equal(formatarCelular('27999887766'), '(27) 99988-7766');
  assert.equal(formatarCEP('29000123'), '29000-123');
});

test('validadores de CPF, CNH, celular, CEP e senha rejeitam entradas invalidas e aceitam validas', () => {
  assert.equal(validarCPF('123.456.789-01'), true);
  assert.equal(validarCPF('111.111.111-11'), false);
  assert.equal(validarCPF('123'), false);

  assert.equal(validarCNH('12345678901'), true);
  assert.equal(validarCNH('00000000000'), false);

  assert.equal(validarCelular('(27) 99988-7766'), true);
  assert.equal(validarCelular('12345'), false);

  assert.equal(validarCEP('29000-123'), true);
  assert.equal(validarCEP('2900'), false);

  assert.equal(validarSenha('Curta1!'), 'A senha deve possuir no mínimo 8 caracteres.');
  assert.equal(validarSenha('SemNumero!'), 'A senha deve possuir pelo menos um número.');
  assert.equal(validarSenha('SemEspecial1'), 'A senha deve possuir pelo menos um caractere especial.');
  assert.equal(validarSenha('12345678!a'), 'Evite sequências ou repetições, como 123456789.');
  assert.equal(validarSenha('Victor99!', 'Victor Severiano'), 'A senha não pode conter seu nome ou sobrenome.');
  assert.equal(validarSenha('Segura#2026', 'Victor Severiano'), null);
});

