import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import ModalFeedback from './ModalFeedback';
import Input from './Input';
import Button from './Button';
import authService from '../../services/auth.service';
import { formatarCPF } from '../../utils/formatters';
import {
  ETAPAS_RECUPERACAO,
  MENSAGEM_SUCESSO_REDEFINICAO,
  REQUISITOS_SENHA_RECUPERACAO,
  criarEstadoInicialRecuperacao,
  submeterVerificacaoIdentidade,
  submeterRedefinicaoSenha,
} from '../../utils/recuperacaoSenha';

/**
 * ModalRecuperacaoSenha — Fluxo em etapas para recuperação e redefinição de senha:
 * 1. Validação de login + CPF no backend
 * 2. Definição e confirmação da nova senha com revalidação no backend
 * 3. Notificação de conclusão usando ModalFeedback existente, mantendo o usuário na tela de login
 */
const ModalRecuperacaoSenha = ({ isOpen, onClose, onSuccess }) => {
  const [estado, setEstado] = useState(criarEstadoInicialRecuperacao);
  const emEnvioRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      emEnvioRef.current = false;
      setEstado(criarEstadoInicialRecuperacao());
    }
  }, [isOpen]);

  const handleFechar = () => {
    if (emEnvioRef.current) return;
    setEstado(criarEstadoInicialRecuperacao());
    onClose();
  };

  const handleCampoChange = (e) => {
    const { name, value } = e.target;
    const novoValor = name === 'cpf' ? formatarCPF(value) : value;

    setEstado((prev) => ({
      ...prev,
      [name]: novoValor,
      erroGeral: '',
      fieldErrors: prev.fieldErrors[name]
        ? { ...prev.fieldErrors, [name]: undefined }
        : prev.fieldErrors,
    }));
  };

  const handleContinuarIdentidade = async (e) => {
    e.preventDefault();
    if (emEnvioRef.current || estado.loading) return;

    emEnvioRef.current = true;
    const instantaneo = { ...estado, erroGeral: '' };
    setEstado((prev) => ({ ...prev, loading: true, erroGeral: '' }));

    try {
      const resultado = await submeterVerificacaoIdentidade({
        estadoAtual: instantaneo,
        servicoAuth: authService,
      });
      if (resultado.alterado) {
        setEstado(resultado.estado);
      } else {
        setEstado((prev) => ({ ...prev, loading: false }));
      }
    } finally {
      emEnvioRef.current = false;
    }
  };

  const handleConfirmarNovaSenha = async (e) => {
    e.preventDefault();
    if (emEnvioRef.current || estado.loading) return;

    emEnvioRef.current = true;
    const instantaneo = { ...estado, erroGeral: '' };
    setEstado((prev) => ({ ...prev, loading: true, erroGeral: '' }));

    try {
      const resultado = await submeterRedefinicaoSenha({
        estadoAtual: instantaneo,
        servicoAuth: authService,
        onSuccess,
      });
      if (resultado.alterado) {
        setEstado(resultado.estado);
      } else {
        setEstado((prev) => ({ ...prev, loading: false }));
      }
    } finally {
      emEnvioRef.current = false;
    }
  };

  const handleVoltarParaIdentidade = () => {
    if (emEnvioRef.current || estado.loading) return;
    setEstado((prev) => ({
      ...prev,
      etapa: ETAPAS_RECUPERACAO.IDENTIDADE,
      novaSenha: '',
      confirmarSenha: '',
      erroGeral: '',
      fieldErrors: {},
    }));
  };

  if (estado.etapa === ETAPAS_RECUPERACAO.SUCESSO) {
    return (
      <ModalFeedback
        isOpen={isOpen}
        onClose={handleFechar}
        titulo="Senha redefinida"
        mensagem={estado.mensagemSucesso || MENSAGEM_SUCESSO_REDEFINICAO}
        tamanho="sm"
        IconComponent={CheckCircle2}
        iconColor="var(--color-success)"
        closeButtonId="btn-concluir-recuperacao-senha"
        textoBotao="Voltar ao login"
      />
    );
  }

  const tituloModal =
    estado.etapa === ETAPAS_RECUPERACAO.NOVA_SENHA
      ? 'Definir nova senha'
      : 'Recuperar senha';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleFechar}
      title={tituloModal}
      size="sm"
    >
      {estado.etapa === ETAPAS_RECUPERACAO.IDENTIDADE ? (
        <form className="login-form" onSubmit={handleContinuarIdentidade} noValidate>
          <p className="wizard-header__desc">
            Informe seu usuário e o CPF cadastrado para validar sua identidade.
          </p>

          <Input
            id="recuperacao-usuario"
            name="usuario"
            label="Usuário"
            required
            type="text"
            placeholder="Digite seu usuário cadastrado"
            value={estado.usuario}
            onChange={handleCampoChange}
            error={estado.fieldErrors.usuario}
            disabled={estado.loading}
            autoComplete="username"
            autoFocus
          />

          <Input
            id="recuperacao-cpf"
            name="cpf"
            label="CPF"
            required
            type="text"
            inputMode="numeric"
            maxLength={14}
            placeholder="000.000.000-00"
            value={estado.cpf}
            onChange={handleCampoChange}
            error={estado.fieldErrors.cpf}
            disabled={estado.loading}
            autoComplete="off"
          />

          {estado.erroGeral && (
            <div className="login-error" role="alert">
              <TriangleAlert size={16} aria-hidden="true" />
              <span>{estado.erroGeral}</span>
            </div>
          )}

          <div className="form-actions form-actions--between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleFechar}
              disabled={estado.loading}
            >
              Cancelar
            </Button>
            <Button
              id="btn-continuar-recuperacao"
              type="submit"
              variant="primary"
              loading={estado.loading}
            >
              Continuar
            </Button>
          </div>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleConfirmarNovaSenha} noValidate>
          <p className="wizard-header__desc">
            Identidade confirmada. Defina e confirme sua nova senha abaixo.
          </p>

          <div>
            <Input
              id="recuperacao-nova-senha"
              name="novaSenha"
              label="Nova senha"
              required
              type="password"
              showPasswordToggle
              placeholder="Digite sua nova senha"
              value={estado.novaSenha}
              onChange={handleCampoChange}
              error={estado.fieldErrors.novaSenha}
              disabled={estado.loading}
              autoComplete="new-password"
              autoFocus
            />

            <div className="password-rules">
              <p className="password-rules__title">Requisitos da senha:</p>
              <ul className="password-rules__list">
                {REQUISITOS_SENHA_RECUPERACAO.map((regra) => (
                  <li key={regra}>{regra}</li>
                ))}
              </ul>
            </div>
          </div>

          <Input
            id="recuperacao-confirmar-senha"
            name="confirmarSenha"
            label="Confirmar nova senha"
            required
            type="password"
            showPasswordToggle
            placeholder="Repita sua nova senha"
            value={estado.confirmarSenha}
            onChange={handleCampoChange}
            error={estado.fieldErrors.confirmarSenha}
            disabled={estado.loading}
            autoComplete="new-password"
          />

          {estado.erroGeral && (
            <div className="login-error" role="alert">
              <TriangleAlert size={16} aria-hidden="true" />
              <span>{estado.erroGeral}</span>
            </div>
          )}

          <div className="form-actions form-actions--between">
            <Button
              type="button"
              variant="outline"
              onClick={handleVoltarParaIdentidade}
              disabled={estado.loading}
            >
              Voltar
            </Button>
            <Button
              id="btn-redefinir-senha"
              type="submit"
              variant="primary"
              loading={estado.loading}
            >
              Redefinir senha
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ModalRecuperacaoSenha;
