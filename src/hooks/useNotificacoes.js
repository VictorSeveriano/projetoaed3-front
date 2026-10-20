import { useState, useEffect, useCallback } from 'react';
import notificacoesService from '../services/notificacoes.service';
import { useAuth } from '../context/AuthContext';

/**
 * useNotificacoes — Hook compartilhado de listagem, marcação de leitura e tratamento
 * de erros de notificações (utilizado por NotificacoesPage e NotificacoesMotoristaPage).
 */
export function useNotificacoes() {
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroModal, setErroModal] = useState({ aberto: false, titulo: 'Erro', mensagem: '' });

  const exibirErro = useCallback((err, mensagemPadrao) => {
    setErroModal({
      aberto: true,
      titulo: 'Erro',
      mensagem: err?.response?.data?.message || mensagemPadrao,
    });
  }, []);

  const fecharErro = useCallback(() => {
    setErroModal((prev) => ({ ...prev, aberto: false }));
  }, []);

  const carregar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      const dados = await notificacoesService.listar();
      setNotificacoes(dados?.notificacoes || []);
    } catch (err) {
      exibirErro(err, 'Não foi possível carregar as notificações.');
    } finally {
      setLoading(false);
    }
  }, [usuario?.id, exibirErro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleLerTodas = useCallback(async () => {
    try {
      await notificacoesService.lerTodas();
      await carregar();
      window.dispatchEvent(new Event('notificacoes-atualizadas'));
    } catch (err) {
      exibirErro(err, 'Não foi possível marcar todas as notificações como lidas.');
    }
  }, [carregar, exibirErro]);

  const handleMarcarLida = useCallback(
    async (id, { silencioso = false } = {}) => {
      try {
        await notificacoesService.ler(id);
        window.dispatchEvent(new Event('notificacoes-atualizadas'));
        return true;
      } catch (err) {
        if (!silencioso) {
          exibirErro(err, 'Não foi possível marcar a notificação como lida.');
        }
        return false;
      }
    },
    [exibirErro]
  );

  return {
    notificacoes,
    loading,
    erroModal,
    exibirErro,
    fecharErro,
    carregar,
    handleLerTodas,
    handleMarcarLida,
  };
}

