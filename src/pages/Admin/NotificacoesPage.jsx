import React from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ModalErro from '../../components/ui/ModalErro';
import {
  Bell, Check, Car, Route, UserPlus, ShieldCheck, CheckCircle2, XCircle, Navigation,
} from 'lucide-react';
import { formatarDataHorario } from '../../utils/formatters';
import { classificarNotificacaoVisual } from '../../utils/notificacaoVisual';
import { useNavigate } from 'react-router-dom';
import { useNotificacoes } from '../../hooks/useNotificacoes';

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

const NotificacoesPage = () => {
  const {
    notificacoes,
    loading,
    erroModal,
    fecharErro,
    handleLerTodas,
    handleMarcarLida,
  } = useNotificacoes();
  const navigate = useNavigate();

  const handleNotificacaoClick = async (n) => {
    if (!n.lida) {
      const ok = await handleMarcarLida(n.id);
      if (!ok) return;
    }
    if (n.tipo === 'SOLICITACAO_MOTORISTA') navigate('/motoristas/analise');
    if (n.tipo === 'SOLICITACAO_VEICULO') navigate('/veiculos/analise');
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
        subtitle="Mantenha-se atualizado sobre as atividades do sistema"
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
                  </div>
                  <p className="notificacao-card__message">{n.mensagem}</p>
                  <div className="notificacao-card__meta">
                    <span>{formatarDataHorario(n.criadaEm)}</span>
                    <span>•</span>
                    <span>{n.lida ? 'Lida' : 'Não lida'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalErro
        isOpen={erroModal.aberto}
        onClose={fecharErro}
        titulo={erroModal.titulo}
        mensagem={erroModal.mensagem}
      />
    </div>
  );
};

export default NotificacoesPage;
