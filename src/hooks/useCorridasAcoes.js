import { useState, useMemo, useCallback } from 'react';
import corridasService from '../services/corridas.service';
import { validarMotivo, extrairMensagemErroApi } from '../utils/confirmacaoEmbarque';
import { emitirNotificacoesAtualizadas } from '../utils/appEvents';

/**
 * useCorridasAcoes — Gerencia estados e operações dos modais de cancelamento,
 * finalização e confirmação de pagamento em CorridasTabs.
 */
export function useCorridasAcoes({ corridas = [], ehMotorista = false, onAcao }) {
  const [corridaToCancel, setCorridaToCancel] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [corridaToFinalizar, setCorridaToFinalizar] = useState(null);
  const [corridaToConfirmarPag, setCorridaToConfirmarPag] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [confirmandoPag, setConfirmandoPag] = useState(false);
  const [actionError, setActionError] = useState('');

  const corridaCancelamentoObj = useMemo(() => {
    if (!corridaToCancel) return null;
    if (typeof corridaToCancel === 'object') return corridaToCancel;
    return corridas.find((c) => c.id === corridaToCancel) || { id: corridaToCancel };
  }, [corridaToCancel, corridas]);

  const abrirCancelamento = useCallback((corrida) => {
    setActionError('');
    setMotivoCancelamento('');
    setCorridaToCancel(corrida);
  }, []);

  const fecharCancelamento = useCallback(() => {
    if (cancelando) return;
    setCorridaToCancel(null);
    setMotivoCancelamento('');
    setActionError('');
  }, [cancelando]);

  const atualizarMotivoCancelamento = useCallback((valor) => {
    setMotivoCancelamento(valor);
    setActionError('');
  }, []);

  const abrirFinalizacao = useCallback((corridaId) => {
    setActionError('');
    setCorridaToFinalizar(corridaId);
  }, []);

  const fecharFinalizacao = useCallback(() => {
    setCorridaToFinalizar(null);
    setActionError('');
  }, []);

  const abrirConfirmarPagamento = useCallback((corridaId) => {
    setActionError('');
    setCorridaToConfirmarPag(corridaId);
  }, []);

  const fecharConfirmarPagamento = useCallback(() => {
    setCorridaToConfirmarPag(null);
    setActionError('');
  }, []);

  const handleCancelar = useCallback(async () => {
    if (!corridaCancelamentoObj || cancelando) return;
    const motivoTrim = (motivoCancelamento || '').trim();
    if (ehMotorista || motivoTrim.length > 0) {
      const erroValidacao = validarMotivo(motivoCancelamento);
      if (erroValidacao) {
        setActionError(erroValidacao);
        return;
      }
    }
    setCancelando(true);
    setActionError('');
    try {
      await corridasService.cancelar(
        corridaCancelamentoObj.id,
        motivoTrim ? { motivo: motivoTrim } : {}
      );
      setCorridaToCancel(null);
      setMotivoCancelamento('');
      emitirNotificacoesAtualizadas();
      if (onAcao) onAcao();
    } catch (err) {
      setActionError(extrairMensagemErroApi(err, 'Erro ao cancelar corrida.'));
    } finally {
      setCancelando(false);
    }
  }, [corridaCancelamentoObj, cancelando, motivoCancelamento, ehMotorista, onAcao]);

  const handleFinalizar = useCallback(async () => {
    if (!corridaToFinalizar) return;
    setFinalizando(true);
    setActionError('');
    try {
      await corridasService.finalizar(corridaToFinalizar);
      setCorridaToFinalizar(null);
      if (onAcao) onAcao();
    } catch (err) {
      setActionError(extrairMensagemErroApi(err, 'Erro ao finalizar corrida.'));
    } finally {
      setFinalizando(false);
    }
  }, [corridaToFinalizar, onAcao]);

  const handleConfirmarPagamento = useCallback(async () => {
    if (!corridaToConfirmarPag) return;
    setConfirmandoPag(true);
    setActionError('');
    try {
      await corridasService.confirmarPagamento(corridaToConfirmarPag);
      setCorridaToConfirmarPag(null);
      if (onAcao) onAcao();
    } catch (err) {
      setActionError(extrairMensagemErroApi(err, 'Erro ao confirmar pagamento.'));
    } finally {
      setConfirmandoPag(false);
    }
  }, [corridaToConfirmarPag, onAcao]);

  return {
    corridaCancelamentoObj,
    motivoCancelamento,
    corridaToFinalizar,
    corridaToConfirmarPag,
    cancelando,
    finalizando,
    confirmandoPag,
    actionError,
    abrirCancelamento,
    fecharCancelamento,
    atualizarMotivoCancelamento,
    abrirFinalizacao,
    fecharFinalizacao,
    abrirConfirmarPagamento,
    fecharConfirmarPagamento,
    handleCancelar,
    handleFinalizar,
    handleConfirmarPagamento,
  };
}
