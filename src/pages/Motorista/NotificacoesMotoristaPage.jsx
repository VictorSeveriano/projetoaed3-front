import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import api from '../../services/api';
import corridasService from '../../services/corridas.service';
import { Bell, Check, CheckCircle, XCircle } from 'lucide-react';
import { formatarDataHorario } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

/**
 * NotificacoesMotoristaPage — Página de notificações do motorista.
 *
 * Exibe todas as notificações do motorista.
 * Para notificações do tipo NOVA_CORRIDA com acaoMotorista='PENDENTE',
 * exibe os botões de Aceitar e Recusar.
 *
 * Reutiliza a mesma estrutura visual da NotificacoesPage do admin.
 */
const NotificacoesMotoristaPage = () => {
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acaoLoading, setAcaoLoading] = useState(null); // corridaId em processamento
  const [confirmarAcao, setConfirmarAcao] = useState(null); // { tipo: 'aceitar'|'recusar', corridaId, notifId }

  const carregar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/notificacoes?destinatarioId=${usuario.id}`);
      setNotificacoes(data.data?.notificacoes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleLerTodas = async () => {
    try {
      await api.patch(`/notificacoes/ler-todas?destinatarioId=${usuario.id}`);
      carregar();
    } catch (e) {}
  };

  const handleMarcarLida = async (id) => {
    try {
      await api.patch(`/notificacoes/${id}/ler`);
    } catch (e) {}
  };

  const handleAceitar = async () => {
    if (!confirmarAcao) return;
    const { corridaId, notifId } = confirmarAcao;
    setAcaoLoading(corridaId);
    setConfirmarAcao(null);
    try {
      await corridasService.aceitar(corridaId, usuario.id);
      if (notifId) await handleMarcarLida(notifId);
      await carregar();
    } catch (err) {
      console.error('Erro ao aceitar corrida:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Erro ao aceitar a corrida.');
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
      await corridasService.recusar(corridaId, usuario.id);
      if (notifId) await handleMarcarLida(notifId);
      await carregar();
    } catch (err) {
      console.error('Erro ao recusar corrida:', err.response?.data?.message || err.message);
    } finally {
      setAcaoLoading(null);
    }
  };

  const ACAO_LABELS = {
    PENDENTE:  { label: 'Pendente',  color: 'warning' },
    ACEITA:    { label: 'Aceita',    color: 'success' },
    RECUSADA:  { label: 'Recusada', color: 'danger'  },
  };

  return (
    <div className="page animate-fade-in">
      <Header
        title="Notificações"
        subtitle="Corridas disponíveis e atualizações do sistema"
        actions={
          notificacoes.some((n) => !n.lida) && (
            <Button onClick={handleLerTodas} variant="ghost" size="sm">
              <Check size={16} style={{ marginRight: '4px' }} />
              Marcar todas como lidas
            </Button>
          )
        }
      />

      {loading ? (
        <Loading message="Carregando notificações..." />
      ) : notificacoes.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} strokeWidth={1.5} />}
          title="Nenhuma notificação"
          description="Você não tem nenhuma notificação no momento."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px' }}>
          {notificacoes.map((n) => {
            const isNovaCorrida = n.tipo === 'NOVA_CORRIDA';
            const isPendente = isNovaCorrida && n.acaoMotorista === 'PENDENTE';
            const acaoInfo = isNovaCorrida ? ACAO_LABELS[n.acaoMotorista] : null;
            const emProcessamento = acaoLoading === n.referenciaId;

            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '16px',
                  borderLeft: !n.lida
                    ? '4px solid var(--color-primary)'
                    : isNovaCorrida
                      ? '4px solid var(--color-warning)'
                      : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontWeight: !n.lida ? 600 : 400 }}>{n.titulo}</h4>
                      {!n.lida && <Badge label="Nova" color="primary" />}
                      {acaoInfo && (
                        <Badge label={acaoInfo.label} color={acaoInfo.color} />
                      )}
                    </div>
                    <p
                      style={{
                        margin: '0 0 8px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-line',
                        fontSize: '0.9rem',
                      }}
                    >
                      {n.mensagem}
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {formatarDataHorario(n.criadaEm)}
                    </small>
                  </div>

                  {/* Botões de ação para corridas pendentes */}
                  {isPendente && n.referenciaId && (
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <Button
                        id={`btn-aceitar-${n.referenciaId}`}
                        variant="success"
                        size="sm"
                        loading={emProcessamento}
                        onClick={() => setConfirmarAcao({ tipo: 'aceitar', corridaId: n.referenciaId, notifId: n.id })}
                      >
                        <CheckCircle size={14} style={{ marginRight: '4px' }} />
                        Aceitar
                      </Button>
                      <Button
                        id={`btn-recusar-${n.referenciaId}`}
                        variant="danger"
                        size="sm"
                        loading={emProcessamento}
                        onClick={() => setConfirmarAcao({ tipo: 'recusar', corridaId: n.referenciaId, notifId: n.id })}
                      >
                        <XCircle size={14} style={{ marginRight: '4px' }} />
                        Recusar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmação de aceite */}
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

      {/* Modal de confirmação de recusa */}
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
    </div>
  );
};

export default NotificacoesMotoristaPage;
