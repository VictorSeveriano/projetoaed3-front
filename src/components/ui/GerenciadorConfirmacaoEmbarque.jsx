import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import corridasService from '../../services/corridas.service';
import ModalConfirmacaoEmbarque from './ModalConfirmacaoEmbarque';

const INTERVALO_BUSCA_MS = 30 * 1000;
const INTERVALO_RELOGIO_MS = 15 * 1000;
const ADIAR_AO_FECHAR_MS = 2 * 60 * 1000;
const REABRIR_A_CAMINHO_ANTES_MS = 5 * 60 * 1000;

/** Decide se a corrida precisa de confirmação de embarque do perfil informado, no instante `agora`. */
export function precisaConfirmacao(corrida, perfil, agora) {
  const horario = new Date(corrida.dataHorario).getTime();
  if (Number.isNaN(horario) || horario > agora) return false;

  if (perfil === 'MOTORISTA') {
    if (corrida.status !== 'CONFIRMADA' || corrida.embarqueMotoristaConfirmado === true) return false;
    if (corrida.situacaoMotorista === 'A_CAMINHO') {
      // Não solicita repetidamente enquanto está a caminho; reabre perto do fim do prazo estendido
      const prazo = corrida.prazoConfirmacaoEm ? new Date(corrida.prazoConfirmacaoEm).getTime() : 0;
      return prazo > 0 && prazo - agora <= REABRIR_A_CAMINHO_ANTES_MS;
    }
    return true;
  }

  if (perfil === 'USUARIO') {
    if (!['CONFIRMADA', 'EM_ANDAMENTO'].includes(corrida.status)) return false;
    return corrida.embarquePassageiroConfirmado == null;
  }
  return false;
}

/**
 * GerenciadorConfirmacaoEmbarque — monta a fila de corridas elegíveis e exibe
 * UM modal por vez (ordenado pelo horário agendado).
 */
const GerenciadorConfirmacaoEmbarque = () => {
  const { usuario } = useAuth();
  const perfil = usuario?.perfil;
  const habilitado = perfil === 'MOTORISTA' || perfil === 'USUARIO';

  const [corridas, setCorridas] = useState([]);
  const [corridaManual, setCorridaManual] = useState(null);
  const [agora, setAgora] = useState(() => Date.now());
  const adiadas = useRef(new Map()); // id -> timestamp até o qual não reabrir
  const [, forcar] = useState(0);

  const carregar = useCallback(async () => {
    try {
      const lista = await corridasService.listarPorPerfil();
      setCorridas(Array.isArray(lista) ? lista : []);
    } catch {
      /* silencioso: tenta novamente no próximo ciclo */
    }
  }, []);

  useEffect(() => {
    if (!habilitado || !usuario?.id) return undefined;
    carregar();
    const busca = setInterval(carregar, INTERVALO_BUSCA_MS);
    const relogio = setInterval(() => setAgora(Date.now()), INTERVALO_RELOGIO_MS);
    const abrirManual = (e) => {
      if (e?.detail?.id) {
        adiadas.current.delete(e.detail.id);
        setCorridaManual(e.detail);
      }
    };
    window.addEventListener('notificacoes-atualizadas', carregar);
    window.addEventListener('abrir-modal-embarque', abrirManual);
    return () => {
      clearInterval(busca);
      clearInterval(relogio);
      window.removeEventListener('notificacoes-atualizadas', carregar);
      window.removeEventListener('abrir-modal-embarque', abrirManual);
    };
  }, [habilitado, usuario?.id, carregar]);

  const atual = useMemo(() => {
    if (!habilitado) return null;
    if (corridaManual) {
      const atualizada = corridas.find((c) => c.id === corridaManual.id) || corridaManual;
      return atualizada;
    }
    const fila = corridas
      .filter((c) => precisaConfirmacao(c, perfil, agora))
      .filter((c) => (adiadas.current.get(c.id) || 0) <= agora)
      .sort((a, b) => new Date(a.dataHorario) - new Date(b.dataHorario));
    return fila[0] || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corridas, corridaManual, perfil, agora, habilitado, adiadas.current.size]);

  if (!atual) return null;

  const fechar = () => {
    adiadas.current.set(atual.id, Date.now() + ADIAR_AO_FECHAR_MS);
    setCorridaManual(null);
    forcar((n) => n + 1);
    setAgora(Date.now());
  };

  return (
    <ModalConfirmacaoEmbarque
      corrida={atual}
      perfil={perfil}
      onClose={fechar}
      onConcluido={() => {
        setCorridaManual(null);
        carregar();
        window.dispatchEvent(new Event('corridas-atualizadas'));
      }}
    />
  );
};

export default GerenciadorConfirmacaoEmbarque;

