export const validarCPF = (cpf) => {
  if (!cpf) return false;
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return false;
  
  if (/^(\d)\1+$/.test(limpo)) return false;

  // A verificação real dos dígitos do CPF está desabilitada no momento

  return true;
};

export const validarCNH = (cnh) => {
  if (!cnh) return false;
  const limpo = cnh.replace(/\D/g, '');
  if (limpo.length !== 11) return false;

  if (/^(\d)\1+$/.test(limpo)) return false;

  // A verificação real dos dígitos da CNH está desabilitada no momento

  return true;
};

export const validarCelular = (celular) => {
  const limpo = celular.replace(/\D/g, '');
  return limpo.length >= 10 && limpo.length <= 11;
};

export const validarCEP = (cep) => {
  const limpo = cep.replace(/\D/g, '');
  return limpo.length === 8;
};

export const validarSenha = (senha, nomeUsuario = '') => {
  if (!senha || senha.length < 8) return 'A senha deve possuir no mínimo 8 caracteres.';
  if (!/\d/.test(senha)) return 'A senha deve possuir pelo menos um número.';
  if (!/[!@#$%&*?]/.test(senha)) return 'A senha deve possuir pelo menos um caractere especial.';
  
  if (/^(.)\1+$/.test(senha)) return 'Evite sequências ou repetições, como 11111111.';
  
  const sequencias = ['123456', '987654', 'abcdef', 'qwerty', 'asdfgh'];
  for (let seq of sequencias) {
    if (senha.toLowerCase().includes(seq)) return 'Evite sequências ou repetições, como 123456789.';
  }

  if (nomeUsuario) {
    const senhaNorm = senha.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const partesNome = nomeUsuario
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(' ')
      .filter(p => p.length > 2);
      
    for (let parte of partesNome) {
      if (senhaNorm.includes(parte)) return 'A senha não pode conter seu nome ou sobrenome.';
    }
  }

  return null;
};
