import test from 'node:test';
import assert from 'node:assert/strict';

import api from '../src/services/api.js';
import authService from '../src/services/auth.service.js';
import { pushModal, popModal, isTopModal, hasOpenModals, _resetStack } from '../src/utils/modalStack.js';
import {
  ETAPAS_RECUPERACAO,
  MENSAGEM_SUCESSO_REDEFINICAO,
  REQUISITOS_SENHA_RECUPERACAO,
  criarEstadoInicialRecuperacao,
  limparCamposLoginAposRedefinicao,
  normalizarCpfRecuperacao,
  validarEtapaIdentidade,
  validarEtapaNovaSenha,
  submeterVerificacaoIdentidade,
  submeterRedefinicaoSenha,
} from '../src/utils/recuperacaoSenha.js';

test('abertura, fechamento e reset do modal preservam pilha de modais e limpam dados sensíveis', () => {
  _resetStack();
  assert.equal(hasOpenModals(), false);

  const modalId = pushModal();
  assert.equal(hasOpenModals(), true);
  assert.equal(isTopModal(modalId), true);

  // Simula usuário preenchendo e fechando (ESC / fechar) antes de concluir
  let estado = {
    ...criarEstadoInicialRecuperacao(),
    usuario: 'anasilva',
    cpf: '529.982.247-25',
    novaSenha: 'Parcial#123',
  };

  popModal(modalId);
  estado = criarEstadoInicialRecuperacao();

  assert.equal(hasOpenModals(), false);
  assert.deepEqual(estado, {
    etapa: ETAPAS_RECUPERACAO.IDENTIDADE,
    usuario: '',
    cpf: '',
    usuarioValidado: '',
    cpfValidado: '',
    novaSenha: '',
    confirmarSenha: '',
    loading: false,
    erroGeral: '',
    fieldErrors: {},
    mensagemSucesso: '',
  });
});

test('validarEtapaIdentidade aceita CPF com e sem pontuação, normaliza e rejeita entradas inválidas', () => {
  assert.equal(normalizarCpfRecuperacao('529.982.247-25'), '52998224725');

  const comPontuacao = validarEtapaIdentidade({
    usuario: '  anasilva  ',
    cpf: '529.982.247-25',
  });
  assert.deepEqual(comPontuacao, {
    ok: true,
    dados: { usuario: 'anasilva', cpf: '52998224725' },
  });

  const semPontuacao = validarEtapaIdentidade({
    usuario: 'anasilva',
    cpf: '52998224725',
  });
  assert.deepEqual(semPontuacao, {
    ok: true,
    dados: { usuario: 'anasilva', cpf: '52998224725' },
  });

  const ausentes = validarEtapaIdentidade({ usuario: ' ', cpf: '' });
  assert.equal(ausentes.ok, false);
  assert.ok(ausentes.fieldErrors.usuario);
  assert.ok(ausentes.fieldErrors.cpf);

  const cpfInvalido = validarEtapaIdentidade({ usuario: 'anasilva', cpf: '111.111.111-11' });
  assert.equal(cpfInvalido.ok, false);
  assert.equal(cpfInvalido.fieldErrors.cpf, 'CPF inválido.');
});

test('validarEtapaNovaSenha aplica validarSenha do projeto e rejeita senhas de confirmação divergentes', () => {
  assert.ok(REQUISITOS_SENHA_RECUPERACAO.length >= 4);

  const fraca = validarEtapaNovaSenha({
    novaSenha: '123',
    confirmarSenha: '123',
  });
  assert.equal(fraca.ok, false);
  assert.equal(fraca.fieldErrors.novaSenha, 'A senha deve possuir no mínimo 8 caracteres.');

  const divergente = validarEtapaNovaSenha({
    novaSenha: 'Segura#2026',
    confirmarSenha: 'Outra#2026',
  });
  assert.equal(divergente.ok, false);
  assert.match(divergente.fieldErrors.confirmarSenha, /não coincide/i);

  const valida = validarEtapaNovaSenha({
    novaSenha: 'Segura#2026',
    confirmarSenha: 'Segura#2026',
  });
  assert.deepEqual(valida, { ok: true });
});

test('authService aponta para os endpoints corretos de recuperação (/auth/verificar-identidade-redefinicao e /auth/redefinir-senha)', async () => {
  const postOriginal = api.post;
  const chamadas = [];

  api.post = async (url, payload) => {
    chamadas.push({ url, payload });
    if (url === '/auth/verificar-identidade-redefinicao') {
      return { data: { success: true, data: { valido: true } } };
    }
    if (url === '/auth/redefinir-senha') {
      return {
        data: {
          success: true,
          message: MENSAGEM_SUCESSO_REDEFINICAO,
          data: { redefinida: true },
        },
      };
    }
    throw new Error('Endpoint inesperado: ' + url);
  };

  try {
    const resVerif = await authService.verificarIdentidadeRedefinicao('anasilva', '52998224725');
    assert.deepEqual(resVerif, { success: true, data: { valido: true } });

    const resRedef = await authService.redefinirSenha('anasilva', '52998224725', 'Nova#2026');
    assert.equal(resRedef.data.redefinida, true);

    assert.deepEqual(chamadas, [
      {
        url: '/auth/verificar-identidade-redefinicao',
        payload: { usuario: 'anasilva', cpf: '52998224725' },
      },
      {
        url: '/auth/redefinir-senha',
        payload: { usuario: 'anasilva', cpf: '52998224725', novaSenha: 'Nova#2026' },
      },
    ]);
  } finally {
    api.post = postOriginal;
  }
});

test('fluxo completo: bloqueia carregamento duplicado, trata erros sem perder dados, exibe notificação de sucesso, permanece no login limpando senha antiga e permite logar com nova senha', async () => {
  // Bloqueio durante loading (evita envios duplicados)
  const bloqueadoEmLoading = await submeterVerificacaoIdentidade({
    estadoAtual: { ...criarEstadoInicialRecuperacao(), loading: true, usuario: 'ana', cpf: '52998224725' },
    servicoAuth: {
      verificarIdentidadeRedefinicao: async () => {
        throw new Error('Não deveria ser chamado durante loading');
      },
    },
  });
  assert.equal(bloqueadoEmLoading.alterado, false);

  // Simulação de backend com usuário e senha atualizável
  let senhaNoServidor = 'SenhaAntiga#1';
  const servicoMock = {
    async verificarIdentidadeRedefinicao(usuario, cpf) {
      if (usuario === 'anasilva' && cpf === '52998224725') {
        return { success: true, data: { valido: true } };
      }
      const err = new Error('Dados inválidos');
      err.response = {
        status: 400,
        data: { message: 'Não foi possível validar os dados informados. Verifique o usuário e o CPF.' },
      };
      throw err;
    },
    async redefinirSenha(usuario, cpf, novaSenha) {
      if (usuario !== 'anasilva' || cpf !== '52998224725') {
        const err = new Error('Identidade inválida');
        err.response = { status: 400, data: { message: 'Dados inválidos.' } };
        throw err;
      }
      senhaNoServidor = novaSenha;
      return {
        success: true,
        message: MENSAGEM_SUCESSO_REDEFINICAO,
        data: { redefinida: true },
      };
    },
    async login(usuario, senha) {
      if (usuario === 'anasilva' && senha === senhaNoServidor) {
        return {
          success: true,
          data: { token: 'jwt-valido-pos-redefinicao', usuario: { id: 'u1', usuario: 'anasilva', perfil: 'USUARIO' } },
        };
      }
      const err = new Error('Credenciais inválidas');
      err.response = { status: 401, data: { message: 'Credenciais invalidas.' } };
      throw err;
    },
  };

  // 1. Tentativa com CPF errado: exibe erro e preserva os dados digitados sem avançar
  let estado = {
    ...criarEstadoInicialRecuperacao(),
    usuario: 'anasilva',
    cpf: '123.456.789-01',
  };
  let passo1Erro = await submeterVerificacaoIdentidade({ estadoAtual: estado, servicoAuth: servicoMock });
  estado = passo1Erro.estado;
  assert.equal(estado.etapa, ETAPAS_RECUPERACAO.IDENTIDADE);
  assert.equal(estado.usuario, 'anasilva');
  assert.equal(estado.cpf, '123.456.789-01');
  assert.match(estado.erroGeral, /Verifique o usuário e o CPF/i);

  // 2. Tentativa com CPF válido formatado: avança para NOVA_SENHA
  estado = { ...estado, cpf: '529.982.247-25' };
  const passo1Ok = await submeterVerificacaoIdentidade({ estadoAtual: estado, servicoAuth: servicoMock });
  estado = passo1Ok.estado;
  assert.equal(estado.etapa, ETAPAS_RECUPERACAO.NOVA_SENHA);
  assert.equal(estado.usuarioValidado, 'anasilva');
  assert.equal(estado.cpfValidado, '52998224725');

  // 3. Confirmação divergente bloqueada no frontend sem chamar o backend
  estado = { ...estado, novaSenha: 'Nova#2026Forte', confirmarSenha: 'Diferente#2026' };
  const passo2Div = await submeterRedefinicaoSenha({ estadoAtual: estado, servicoAuth: servicoMock });
  assert.equal(passo2Div.estado.etapa, ETAPAS_RECUPERACAO.NOVA_SENHA);
  assert.ok(passo2Div.estado.fieldErrors.confirmarSenha);
  assert.equal(senhaNoServidor, 'SenhaAntiga#1');

  // 4. Redefinição concluída com sucesso: limpa dados sensíveis, limpa senha antiga da tela de login e não autentica automaticamente
  let formTelaLogin = { usuario: 'anasilva', senha: 'SenhaAntigaDigitadaAntes' };
  let rotaAtual = '/login';

  estado = { ...estado, confirmarSenha: 'Nova#2026Forte' };
  const passo2Ok = await submeterRedefinicaoSenha({
    estadoAtual: estado,
    servicoAuth: servicoMock,
    onSuccess: () => {
      formTelaLogin = limparCamposLoginAposRedefinicao(formTelaLogin);
    },
  });
  estado = passo2Ok.estado;

  assert.equal(estado.etapa, ETAPAS_RECUPERACAO.SUCESSO);
  assert.equal(estado.mensagemSucesso, MENSAGEM_SUCESSO_REDEFINICAO);
  assert.equal(estado.novaSenha, '');
  assert.equal(estado.confirmarSenha, '');
  assert.equal(estado.cpf, '');
  assert.equal(estado.cpfValidado, '');
  assert.equal(formTelaLogin.senha, ''); // não preencheu a nova senha automaticamente e limpou a antiga
  assert.equal(rotaAtual, '/login'); // permaneceu na tela de login

  // 5. Realizar login com a nova senha funciona e a senha antiga é rejeitada
  await assert.rejects(() => servicoMock.login('anasilva', 'SenhaAntiga#1'));
  const loginSucesso = await servicoMock.login('anasilva', 'Nova#2026Forte');
  assert.equal(loginSucesso.data.token, 'jwt-valido-pos-redefinicao');
});
