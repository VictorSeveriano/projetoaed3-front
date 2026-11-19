import { useState, useEffect, useCallback } from 'react';
import corridasService from '../services/corridas.service';
import {
  montarPayloadCancelamentoEmbarque,
  extrairMensagemErroApi,
} from '../utils/confirmacaoEmbarque';
import { emitirNotificacoesAtualizadas } from '../utils/appEvents';

/**
 * useConfirmacaoEmbarque — Encapsula o fluxo de decisão e envio para o modal
 * de confirmação de embarque (etapas, validação de motivo, loading, erros e eventos).
 */
export function useConfirmacaoEmbarque({ corrida, perfil, onConcluido }) {
  const ehMotorista = perfil === 'MOTORISTA';
  const [etapa, setEtapa] = useState('inicial'); // inicial | naoEmbarcou | motivo
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEtapa('inicial');
    setMotivo('');
    setErro('');
    setLoading(false);
  }, [corrida?.id]);

  const irParaEtapa = useCallback((proximaEtapa) => {
    setErro('');
    setEtapa(proximaEtapa);
  }, []);

  const atualizarMotivo = useCallback((valor) => {
    setMotivo(valor);
    setErro('');
  }, []);

  const enviar = useCallback(
    async (payload) => {
      if (!corrida?.id || loading) return; // evita envio duplicado
      setLoading(true);
      setErro('');
      try {
        if (ehMotorista) {
          await corridasService.registrarEmbarqueMotorista(corrida.id, payload);
        } else {
          await corridasService.registrarEmbarquePassageiro(corrida.id, payload);
        }
        emitirNotificacoesAtualizadas();
        if (onConcluido) onConcluido(corrida);
      } catch (err) {
        setErro(extrairMensagemErroApi(err, 'Não foi possível registrar. Tente novamente.'));
      } finally {
        setLoading(false);
      }
    },
    [corrida, ehMotorista, loading, onConcluido]
  );

  const confirmarEmbarque = useCallback(() => {
    return enviar({ acao: 'CONFIRMAR_EMBARQUE' });
  }, [enviar]);

  const informarACaminho = useCallback(() => {
    return enviar({ acao: 'ESTOU_A_CAMINHO' });
  }, [enviar]);

  const registrarAguardando = useCallback(() => {
    return enviar({ acao: 'NAO_EMBARQUEI' });
  }, [enviar]);

  const confirmarCancelamento = useCallback(() => {
    const { erro: msgErro, payload } = montarPayloadCancelamentoEmbarque(ehMotorista, motivo);
    if (msgErro) {
      setErro(msgErro);
      return;
    }
    return enviar(payload);
  }, [ehMotorista, motivo, enviar]);

  return {
    ehMotorista,
    etapa,
    motivo,
    erro,
    loading,
    aCaminho: ehMotorista && corrida?.situacaoMotorista === 'A_CAMINHO',
    motoristaACaminho: !ehMotorista && corrida?.situacaoMotorista === 'A_CAMINHO',
    irParaEtapa,
    atualizarMotivo,
    confirmarEmbarque,
    informarACaminho,
    registrarAguardando,
    confirmarCancelamento,
  };
}
