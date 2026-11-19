import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalErro from '../../components/ui/ModalErro';
import corridasService from '../../services/corridas.service';
import {
  Bell, Check, CheckCircle, XCircle, Car, Route, UserPlus, ShieldCheck, CheckCircle2, Navigation,
} from 'lucide-react';
import { formatarDataHorario } from '../../utils/formatters';
import { classificarNotificacaoVisual } from '../../utils/notificacaoVisual';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { useNavigate } from 'react-router-dom';

const ACAO_LABELS = {
  PENDENTE:  { label: 'Pendente',  color: 'warning' },
  ACEITA:    { label: 'Aceita',    color: 'success' },
  RECUSADA:  { label: 'Recusada',  color: 'danger'  },
  CANCELADA: { label: 'Cancelada', color: 'danger'  },
};

const ICONES_NOTIFICACAO = {
  car: Car,
  route: Route,
  user: UserPlus,
  shield: ShieldCheck,
  check: CheckCircle2,
  cancel: XCircle,
  navigation: Navigation,
  bell: Bell,
};

/**
 * NotificacoesMotoristaPage — Página de notificações do motorista.
 */
const NotificacoesMotoristaPage = () => {
  const {
    notificacoes,
    loading,
    erroModal,
    exibirErro,
    fecharErro,
    carregar,
    handleLerTodas,
    handleMarcarLida,
  } = useNotificacoes();
  const [acaoLoading, setAcaoLoading] = useState(null); // corridaId em processamento
  const [confirmarAcao, setConfirmarAcao] = useState(null); // { tipo: 'aceitar'|'recusar', corridaId, notifId }

  const handleAceitar = async () => {
    if (!confirmarAcao) return;
    const { corridaId, notifId } = confirmarAcao;
    setAcaoLoading(corridaId);
    setConfirmarAcao(null);
    try {
      await corridasService.aceitar(corridaId);
      if (notifId) await handleMarcarLida(notifId, { silencioso: true });
      await carregar();
    } catch (err) {
      exibirErro(err, 'Erro ao aceitar a corrida.');
    } finally {
      setAcaoLoading(null);
    }
  };

  const handleRecusar = async () => {
    if (!confirmarAcao) return;
    const { corridaId, notifId } = confirmarAcao;
    setAcaoLoading(corridaId);
    setConfirmarAcao(null);
    try {
      await corridasService.recusar(corridaId);
      if (notifId) await handleMarcarLida(notifId, { silencioso: true });
      await carregar();
    } catch (err) {
      exibirErro(err, 'Erro ao recusar a corrida.');
    } finally {
      setAcaoLoading(null);
    }
  };

  const navigate = useNavigate();

  const handleNotificacaoClick = async (n) => {
    if (!n.lida) {
      await handleMarcarLida(n.id);
    }
    if (n.tipo === 'ATUALIZACAO_CORRIDA') navigate('/minhas-corridas');
  };

  const handleKeyDown = (e, n) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNotificacaoClick(n);
    }
  };

  return (
    <div className="page animate-fade-in">
      <Header
        title="Notificações"
        subtitle="Corridas disponíveis e atualizações do sistema"
        actions={
          notificacoes.some((n) => !n.lida) && (
            <Button type="button" onClick={handleLerTodas} variant="outline" size="sm">
              <Check size={15} aria-hidden="true" />
              Marcar todas como lidas
            </Button>
          )
        }
      />

      {loading ? (
        <Loading message="Carregando notificações..." />
      ) : notificacoes.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} strokeWidth={1.5} />}
          title="Nenhuma notificação"
          description="Você não tem nenhuma notificação no momento."
        />
      ) : (
        <div className="notificacoes-list" role="list">
          {notificacoes.map((n) => {
            const isNovaCorrida = n.tipo === 'NOVA_CORRIDA';
            const isPendente = isNovaCorrida && n.acaoMotorista === 'PENDENTE';
            const acaoInfo = isNovaCorrida ? ACAO_LABELS[n.acaoMotorista] : null;
            const emProcessamento = acaoLoading === n.referenciaId;
            const visual = classificarNotificacaoVisual(n);
            const IconComp = ICONES_NOTIFICACAO[visual.icone] || Bell;

            return (
              <div
                key={n.id}
                role="listitem"
                tabIndex={0}
                className={`notificacao-card ${!n.lida ? 'notificacao-card--nao-lida' : 'notificacao-card--lida'}`}
                onClick={() => handleNotificacaoClick(n)}
                onKeyDown={(e) => handleKeyDown(e, n)}
              >
                <span className={`notificacao-card__icon notificacao-card__icon--${visual.cor}`} aria-hidden="true">
                  <IconComp size={19} />
                </span>

                <div className="notificacao-card__body">
                  <div className="notificacao-card__top">
                    {!n.lida && <span className="notificacao-card__unread-dot" aria-label="Não lida" />}
                    <h3 className="notificacao-card__title">{n.titulo}</h3>
                    <Badge label={visual.categoria} color={visual.cor} />
                    {!n.lida && <Badge label="Nova" color="primary" />}
                    {acaoInfo && <Badge label={acaoInfo.label} color={acaoInfo.color} dot />}
                  </div>
                  <p className="notificacao-card__message">{n.mensagem}</p>
                  <div className="notificacao-card__meta">
                    <span>{formatarDataHorario(n.criadaEm)}</span>
                    <span>•</span>
                    <span>{n.lida ? 'Lida' : 'Não lida'}</span>
                  </div>
                </div>

                {isPendente && n.referenciaId && (
                  <div className="notificacao-card__actions" onClick={(e) => e.stopPropagation()}>
                    <Button
                      id={`btn-aceitar-${n.referenciaId}`}
                      type="button"
                      variant="success"
                      size="sm"
                      loading={emProcessamento}
                      onClick={() => setConfirmarAcao({ tipo: 'aceitar', corridaId: n.referenciaId, notifId: n.id })}
                    >
                      <CheckCircle size={15} aria-hidden="true" />
                      Aceitar
                    </Button>
                    <Button
                      id={`btn-recusar-${n.referenciaId}`}
                      type="button"
                      variant="danger"
                      size="sm"
                      loading={emProcessamento}
                      onClick={() => setConfirmarAcao({ tipo: 'recusar', corridaId: n.referenciaId, notifId: n.id })}
                    >
                      <XCircle size={15} aria-hidden="true" />
                      Recusar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmarAcao?.tipo === 'aceitar'}
        onClose={() => setConfirmarAcao(null)}
        onConfirm={handleAceitar}
        title="Aceitar corrida?"
        message="Tem certeza que deseja aceitar esta corrida? Você ficará responsável pelo transporte."
        confirmText="Aceitar corrida"
        cancelText="Voltar"
        variant="info"
      />

      <ConfirmationModal
        isOpen={confirmarAcao?.tipo === 'recusar'}
        onClose={() => setConfirmarAcao(null)}
        onConfirm={handleRecusar}
        title="Recusar corrida?"
        message="Tem certeza que deseja recusar esta corrida? Ela permanecerá disponível para outros motoristas."
        confirmText="Recusar"
        cancelText="Voltar"
        variant="warning"
      />

      <ModalErro
        isOpen={erroModal.aberto}
        onClose={fecharErro}
        titulo={erroModal.titulo}
        mensagem={erroModal.mensagem}
      />
    </div>
  );
};

export default NotificacoesMotoristaPage;
