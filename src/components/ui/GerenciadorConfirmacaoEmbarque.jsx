import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import corridasService from '../../services/corridas.service';
import ModalConfirmacaoEmbarque from './ModalConfirmacaoEmbarque';
import {
  ADIAR_AO_FECHAR_MS,
  precisaConfirmacao,
  obterProximaCorridaParaConfirmacao,
} from '../../utils/confirmacaoEmbarque';
import {
  APP_EVENTS,
  emitirCorridasAtualizadas,
  escutarEvento,
} from '../../utils/appEvents';

export { precisaConfirmacao };

const INTERVALO_BUSCA_MS = 30 * 1000;
const INTERVALO_RELOGIO_MS = 15 * 1000;

/**
 * GerenciadorConfirmacaoEmbarque — Mantém exclusivamente o controle da fila de
 * corridas elegíveis, atualização periódica, adiamento e reabertura do modal.
 */
const GerenciadorConfirmacaoEmbarque = () => {
  const { usuario } = useAuth();
  const perfil = usuario?.perfil;
  const habilitado = perfil === 'MOTORISTA' || perfil === 'USUARIO';

  const [corridas, setCorridas] = useState([]);
  const [corridaManual, setCorridaManual] = useState(null);
  const [agora, setAgora] = useState(() => Date.now());
  const adiadas = useRef(new Map());
  const [versaoAdiadas, setVersaoAdiadas] = useState(0);

  const carregar = useCallback(async ({ forcar = false } = {}) => {
    try {
      const lista = await corridasService.listarPorPerfil('', { forcar });
      setCorridas(Array.isArray(lista) ? lista : []);
    } catch {
      /* silencioso: tenta novamente no próximo ciclo */
    }
  }, []);

  useEffect(() => {
    if (!habilitado || !usuario?.id) return undefined;
    carregar({ forcar: false });

    const busca = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      carregar({ forcar: true });
    }, INTERVALO_BUSCA_MS);

    const relogio = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setAgora(Date.now());
    }, INTERVALO_RELOGIO_MS);

    const aoFicarVisivel = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        setAgora(Date.now());
        carregar({ forcar: true });
      }
    };

    const abrirManual = (e) => {
      if (e?.detail?.id) {
        adiadas.current.delete(e.detail.id);
        setCorridaManual(e.detail);
      }
    };
    const pararNotif = escutarEvento(APP_EVENTS.NOTIFICACOES_ATUALIZADAS, () => carregar({ forcar: true }));
    const pararAbrir = escutarEvento(APP_EVENTS.ABRIR_MODAL_EMBARQUE, abrirManual);
    document.addEventListener('visibilitychange', aoFicarVisivel);

    return () => {
      clearInterval(busca);
      clearInterval(relogio);
      pararNotif();
      pararAbrir();
      document.removeEventListener('visibilitychange', aoFicarVisivel);
    };
  }, [habilitado, usuario?.id, carregar]);

  const atual = useMemo(() => {
    if (!habilitado) return null;
    if (corridaManual) {
      return corridas.find((c) => c.id === corridaManual.id) || corridaManual;
    }
    return obterProximaCorridaParaConfirmacao(corridas, perfil, agora, adiadas.current);
  }, [corridas, corridaManual, perfil, agora, habilitado, versaoAdiadas]);

  if (!atual) return null;

  const fechar = () => {
    adiadas.current.set(atual.id, Date.now() + ADIAR_AO_FECHAR_MS);
    setCorridaManual(null);
    setVersaoAdiadas((n) => n + 1);
    setAgora(Date.now());
  };

  return (
    <ModalConfirmacaoEmbarque
      corrida={atual}
      perfil={perfil}
      onClose={fechar}
      onConcluido={() => {
        setCorridaManual(null);
        carregar({ forcar: true });
        emitirCorridasAtualizadas();
      }}
    />
  );
};

export default GerenciadorConfirmacaoEmbarque;
