import { validarCPF, validarSenha } from './validators.js';

export const ETAPAS_RECUPERACAO = Object.freeze({
  IDENTIDADE: 'IDENTIDADE',
  NOVA_SENHA: 'NOVA_SENHA',
  SUCESSO: 'SUCESSO',
});

export const MENSAGEM_SUCESSO_REDEFINICAO =
  'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.';

export const REQUISITOS_SENHA_RECUPERACAO = Object.freeze([
  'No mínimo 8 caracteres',
  'Pelo menos um número',
  'Pelo menos um caractere especial (!@#$%&*?)',
  'Evite sequências ou repetições, como 123456 ou 11111111',
  'Não utilize seu nome ou sobrenome',
]);

export const normalizarCpfRecuperacao = (cpf) => {
  if (typeof cpf !== 'string') return '';
  return cpf.replace(/\D/g, '');
};

export const criarEstadoInicialRecuperacao = () => ({
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

export const limparCamposLoginAposRedefinicao = (formLoginAtual) => ({
  ...formLoginAtual,
  senha: '',
});

export const deveExigirConfirmacaoSaidaRecuperacao = (estado) => {
  if (!estado || estado.loading) return false;
  return (
    estado.etapa === ETAPAS_RECUPERACAO.IDENTIDADE ||
    estado.etapa === ETAPAS_RECUPERACAO.NOVA_SENHA
  );
};

export const validarEtapaIdentidade = ({ usuario, cpf }) => {
  const usuarioLimpo = typeof usuario === 'string' ? usuario.trim() : '';
  const cpfLimpo = normalizarCpfRecuperacao(cpf);
  const fieldErrors = {};

  if (!usuarioLimpo) {
    fieldErrors.usuario = 'Informe seu usuário cadastrado.';
  }

  if (!cpfLimpo) {
    fieldErrors.cpf = 'Informe seu CPF cadastrado.';
  } else if (!validarCPF(cpfLimpo)) {
    fieldErrors.cpf = 'CPF inválido.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    dados: {
      usuario: usuarioLimpo,
      cpf: cpfLimpo,
    },
  };
};

export const validarEtapaNovaSenha = ({ novaSenha, confirmarSenha }) => {
  const senha = typeof novaSenha === 'string' ? novaSenha : '';
  const confirmacao = typeof confirmarSenha === 'string' ? confirmarSenha : '';
  const fieldErrors = {};

  const erroSenha = validarSenha(senha);
  if (erroSenha) {
    fieldErrors.novaSenha = erroSenha;
  }

  if (!confirmacao) {
    fieldErrors.confirmarSenha = 'Confirme a nova senha.';
  } else if (senha !== confirmacao) {
    fieldErrors.confirmarSenha = 'A confirmação de senha não coincide com a nova senha.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true };
};

export const submeterVerificacaoIdentidade = async ({
  estadoAtual,
  servicoAuth,
}) => {
  if (estadoAtual.loading) {
    return { alterado: false, estado: estadoAtual };
  }

  const validacao = validarEtapaIdentidade({
    usuario: estadoAtual.usuario,
    cpf: estadoAtual.cpf,
  });

  if (!validacao.ok) {
    return {
      alterado: true,
      estado: {
        ...estadoAtual,
        erroGeral: '',
        fieldErrors: validacao.fieldErrors,
      },
    };
  }

  try {
    const resposta = await servicoAuth.verificarIdentidadeRedefinicao(
      validacao.dados.usuario,
      validacao.dados.cpf
    );

    if (!resposta?.success || resposta?.data?.valido !== true) {
      return {
        alterado: true,
        estado: {
          ...estadoAtual,
          loading: false,
          fieldErrors: {},
          erroGeral:
            resposta?.message ||
            'Não foi possível validar os dados informados. Verifique o usuário e o CPF.',
        },
      };
    }

    return {
      alterado: true,
      estado: {
        ...estadoAtual,
        etapa: ETAPAS_RECUPERACAO.NOVA_SENHA,
        usuarioValidado: validacao.dados.usuario,
        cpfValidado: validacao.dados.cpf,
        novaSenha: '',
        confirmarSenha: '',
        loading: false,
        erroGeral: '',
        fieldErrors: {},
      },
    };
  } catch (err) {
    const mensagem =
      err?.response?.data?.message ||
      'Não foi possível validar sua identidade no momento. Tente novamente.';
    return {
      alterado: true,
      estado: {
        ...estadoAtual,
        loading: false,
        fieldErrors: {},
        erroGeral: mensagem,
      },
    };
  }
};

export const submeterRedefinicaoSenha = async ({
  estadoAtual,
  servicoAuth,
  onSuccess,
}) => {
  if (estadoAtual.loading) {
    return { alterado: false, estado: estadoAtual };
  }

  if (!estadoAtual.usuarioValidado || !estadoAtual.cpfValidado) {
    return {
      alterado: true,
      estado: {
        ...criarEstadoInicialRecuperacao(),
        erroGeral: 'Valide novamente seu usuário e CPF para continuar.',
      },
    };
  }

  const validacao = validarEtapaNovaSenha({
    novaSenha: estadoAtual.novaSenha,
    confirmarSenha: estadoAtual.confirmarSenha,
  });

  if (!validacao.ok) {
    return {
      alterado: true,
      estado: {
        ...estadoAtual,
        erroGeral: '',
        fieldErrors: validacao.fieldErrors,
      },
    };
  }

  try {
    const resposta = await servicoAuth.redefinirSenha(
      estadoAtual.usuarioValidado,
      estadoAtual.cpfValidado,
      estadoAtual.novaSenha
    );

    if (!resposta?.success || resposta?.data?.redefinida !== true) {
      return {
        alterado: true,
        estado: {
          ...estadoAtual,
          loading: false,
          fieldErrors: {},
          erroGeral:
            resposta?.message ||
            'Não foi possível redefinir a senha. Tente novamente.',
        },
      };
    }

    if (typeof onSuccess === 'function') {
      onSuccess();
    }

    return {
      alterado: true,
      estado: {
        ...criarEstadoInicialRecuperacao(),
        etapa: ETAPAS_RECUPERACAO.SUCESSO,
        mensagemSucesso: MENSAGEM_SUCESSO_REDEFINICAO,
      },
    };
  } catch (err) {
    const mensagem =
      err?.response?.data?.message ||
      'Não foi possível redefinir a senha no momento. Tente novamente.';
    return {
      alterado: true,
      estado: {
        ...estadoAtual,
        loading: false,
        fieldErrors: {},
        erroGeral: mensagem,
      },
    };
  }
};
