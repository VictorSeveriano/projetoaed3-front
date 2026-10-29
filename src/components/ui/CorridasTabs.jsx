import React, { useState, useMemo } from 'react';
import Badge from './Badge';
import Button from './Button';
import EmptyState from './EmptyState';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { validarMotivo, MOTIVO_MAX } from './ModalConfirmacaoEmbarque';
import corridasService from '../../services/corridas.service';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../utils/formatters';
import { CalendarOff, MapPin, Route } from 'lucide-react';

const FORMA_PAGAMENTO_LABELS = {
  DINHEIRO:       'Dinheiro',
  CARTAO_DEBITO:  'Cartão Débito',
  CARTAO_CREDITO: 'Cartão Crédito',
  PIX:            'PIX',
};

const ABAS = [
  { key: 'TODAS',       label: 'Todas'        },
  { key: 'SOLICITADA',  label: 'Solicitadas'  },
  { key: 'CONFIRMADA',  label: 'Confirmadas'  },
  { key: 'EM_ANDAMENTO',label: 'Em andamento' },
  { key: 'FINALIZADA',  label: 'Concluídas'   },
  { key: 'CANCELADA',   label: 'Canceladas'   },
];

/**
 * CorridasTabs — Componente reutilizável de abas de corridas.
 *
 * Parâmetros:
 * @param {object[]}  corridas       - Lista de corridas já filtradas pelo backend (por usuário ou motorista)
 * @param {object}    carrosMap      - Mapa id→{marca, modelo} para exibir o veículo
 * @param {boolean}   loading        - Estado de carregamento
 * @param {string}    [error]        - Mensagem de erro de carregamento
 * @param {boolean}   [podeCancelar] - Se o perfil pode cancelar corridas (default false)
 * @param {boolean}   [podeFinalizar]- Se o perfil pode finalizar corridas (default false)
 * @param {function}  onAcao         - Callback após ação (cancelar/finalizar) para recarregar
 */
/**
 * Regra pura que determina se o botão Cancelar deve ser exibido para a corrida e perfil atuais.
 */
export function podeExibirBotaoCancelar(
  corrida,
  { podeCancelar = false, podeConfirmarPagamento = false, podeFinalizar = false, perfil = '' } = {}
) {
  if (!corrida || !podeCancelar) return false;
  if (corrida.status === 'FINALIZADA' || corrida.status === 'CANCELADA' || corrida.status === 'EM_ANDAMENTO') {
    return false;
  }
  const ehMotorista = perfil === 'MOTORISTA' || (podeConfirmarPagamento && !podeFinalizar);
  if (ehMotorista) {
    return corrida.status === 'CONFIRMADA' && corrida.embarqueMotoristaConfirmado !== true;
  }
  const ehAdmin = perfil === 'ADMINISTRADOR' || podeFinalizar;
  if (ehAdmin) {
    return corrida.status === 'SOLICITADA' || corrida.status === 'CONFIRMADA';
  }
  return (corrida.status === 'SOLICITADA' || corrida.status === 'CONFIRMADA') && corrida.embarqueMotoristaConfirmado !== true;
}

const CorridasTabs = ({
  corridas = [],
  carrosMap = {},
  loading = false,
  error = '',
  podeCancelar = false,
  podeFinalizar = false,
  podeConfirmarPagamento = false,
  perfil = '',
  onAcao,
}) => {
  const ehMotorista = perfil === 'MOTORISTA' || (podeConfirmarPagamento && !podeFinalizar);
  const ehPassageiro = perfil === 'USUARIO' || (podeCancelar && !podeConfirmarPagamento && !podeFinalizar);
  const [abaAtiva, setAbaAtiva]           = useState('TODAS');
  const [corridaToCancel, setCorridaToCancel] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [corridaToFinalizar, setCorridaToFinalizar] = useState(null);
  const [corridaToConfirmarPag, setCorridaToConfirmarPag] = useState(null);
  const [cancelando, setCancelando]       = useState(false);
  const [finalizando, setFinalizando]     = useState(false);
  const [confirmandoPag, setConfirmandoPag] = useState(false);
  const [actionError, setActionError]     = useState('');

  const corridasFiltradas = useMemo(() => {
    if (abaAtiva === 'TODAS') return corridas;
    return corridas.filter((c) => c.status === abaAtiva);
  }, [corridas, abaAtiva]);

  // Contadores por aba para exibir badges
  const contadores = useMemo(() => {
    const map = { TODAS: corridas.length };
    ABAS.slice(1).forEach((a) => {
      map[a.key] = corridas.filter((c) => c.status === a.key).length;
    });
    return map;
  }, [corridas]);

  const corridaCancelamentoObj = useMemo(() => {
    if (!corridaToCancel) return null;
    if (typeof corridaToCancel === 'object') return corridaToCancel;
    return corridas.find((c) => c.id === corridaToCancel) || { id: corridaToCancel };
  }, [corridaToCancel, corridas]);

  const handleCancelar = async () => {
    if (!corridaCancelamentoObj || cancelando) return;
    const motivoTrim = (motivoCancelamento || '').trim();
    if (ehMotorista || motivoTrim.length > 0) {
      const erroValidacao = validarMotivo(motivoCancelamento);
      if (erroValidacao) {
        setActionError(erroValidacao);
        return;
      }
    }
    setCancelando(true); setActionError('');
    try {
      await corridasService.cancelar(
        corridaCancelamentoObj.id,
        motivoTrim ? { motivo: motivoTrim } : {}
      );
      setCorridaToCancel(null);
      setMotivoCancelamento('');
      window.dispatchEvent(new Event('notificacoes-atualizadas'));
      if (onAcao) onAcao();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Erro ao cancelar corrida.');
    } finally { setCancelando(false); }
  };

  const handleFinalizar = async () => {
    if (!corridaToFinalizar) return;
    setFinalizando(true); setActionError('');
    try {
      await corridasService.finalizar(corridaToFinalizar);
      setCorridaToFinalizar(null);
      if (onAcao) onAcao();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Erro ao finalizar corrida.');
    } finally { setFinalizando(false); }
  };

  const handleConfirmarPagamento = async () => {
    if (!corridaToConfirmarPag) return;
    setConfirmandoPag(true); setActionError('');
    try {
      await corridasService.confirmarPagamento(corridaToConfirmarPag);
      setCorridaToConfirmarPag(null);
      if (onAcao) onAcao();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Erro ao confirmar pagamento.');
    } finally { setConfirmandoPag(false); }
  };

  const nomeVeiculo = (veiculoId) => {
    if (!veiculoId) return '—';
    const v = carrosMap[veiculoId];
    return v ? `${v.marca} ${v.modelo}` : `#${veiculoId}`;
  };

  if (loading) {
    return (
      <div className="loading-wrapper" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-text">Carregando corridas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Abas de navegação */}
      <nav className="corridas-tabs" aria-label="Filtrar corridas por status">
        {ABAS.map((aba) => (
          <button
            key={aba.key}
            id={`tab-corridas-${aba.key.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={abaAtiva === aba.key}
            className={`corridas-tab ${abaAtiva === aba.key ? 'corridas-tab--ativa' : ''}`}
            onClick={() => setAbaAtiva(aba.key)}
          >
            {aba.label}
            {contadores[aba.key] > 0 && (
              <span className="corridas-tab__count" aria-label={`${contadores[aba.key]} corridas`}>
                {contadores[aba.key]}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Conteúdo da aba */}
      <div role="tabpanel" aria-label={`Corridas: ${ABAS.find((a) => a.key === abaAtiva)?.label}`}>
        {corridasFiltradas.length === 0 ? (
          <EmptyState
            icon={<CalendarOff size={48} strokeWidth={1.5} />}
            title="Nenhuma corrida encontrada"
            description={
              abaAtiva === 'TODAS'
                ? 'Você ainda não possui corridas registradas.'
                : `Nenhuma corrida com status "${ABAS.find((a) => a.key === abaAtiva)?.label}" encontrada.`
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table" role="table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Origem</th>
                  <th scope="col">Destino</th>
                  <th scope="col">Data/Horário</th>
                  <th scope="col">Distância</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Classe</th>
                  <th scope="col">Pagamento</th>
                  <th scope="col">Veículo</th>
                  <th scope="col">Status</th>
                  {(podeCancelar || podeFinalizar || podeConfirmarPagamento) && <th scope="col">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {corridasFiltradas.map((c) => {
                  const statusInfo = STATUS_LABELS[c.status] || { label: c.status, color: 'muted' };
                  const podeAcaoCancelar = podeExibirBotaoCancelar(c, {
                    podeCancelar,
                    podeConfirmarPagamento,
                    podeFinalizar,
                    perfil,
                  });
                  const podeAcaoFinalizar = podeFinalizar && (c.status === 'CONFIRMADA' || c.status === 'EM_ANDAMENTO');
                  const horarioChegou = c.dataHorario && new Date(c.dataHorario).getTime() <= Date.now();
                  const podeConfirmarEmbarqueMotorista = podeConfirmarPagamento && c.status === 'CONFIRMADA' && horarioChegou && c.embarqueMotoristaConfirmado !== true;
                  const podeConfirmarEmbarquePassageiro = podeCancelar && !podeFinalizar && (c.status === 'CONFIRMADA' || c.status === 'EM_ANDAMENTO') && horarioChegou && c.embarquePassageiroConfirmado == null;
                  return (
                    <tr key={c.id} className="data-table__row">
                      <td className="data-table__cell">#{c.id.substring(0, 6)}</td>
                      <td className="data-table__cell">
                        <span className="corridas-local">
                          <MapPin size={12} aria-hidden="true" />
                          {c.origemNome}
                        </span>
                      </td>
                      <td className="data-table__cell">
                        <span className="corridas-local">
                          <MapPin size={12} aria-hidden="true" />
                          {c.destinoNome}
                        </span>
                      </td>
                      <td className="data-table__cell">{formatarDataHorario(c.dataHorario)}</td>
                      <td className="data-table__cell">
                        <span className="corridas-metric">
                          <Route size={12} aria-hidden="true" />
                          {c.distanciaKm} km
                        </span>
                      </td>
                      <td className="data-table__cell">{formatarMoeda(c.valor)}</td>
                      <td className="data-table__cell">
                        <Badge
                          label={c.classe || 'NORMAL'}
                          color={c.classe === 'PREMIUM' ? 'warning' : c.classe === 'BASICO' ? 'muted' : 'info'}
                        />
                      </td>
                      <td className="data-table__cell" style={{ fontSize: '0.82rem' }}>
                        {FORMA_PAGAMENTO_LABELS[c.formaPagamento] || c.formaPagamento || '—'}
                      </td>
                      <td className="data-table__cell">{nomeVeiculo(c.veiculoId)}</td>
                      <td className="data-table__cell">
                        <Badge label={statusInfo.label} color={statusInfo.color} />
                        {c.status === 'CONFIRMADA' && c.situacaoMotorista === 'A_CAMINHO' && (
                          <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--color-warning)' }}>Motorista a caminho</div>
                        )}
                        {c.status === 'EM_ANDAMENTO' && c.embarqueMotoristaConfirmado && (
                          <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-secondary)' }}>Embarque confirmado</div>
                        )}
                        {c.status === 'CANCELADA' && (c.motivoCancelamento || c.canceladoPor) && (
                          <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-secondary)', maxWidth: 240 }}>
                            {c.canceladoPor === 'MOTORISTA' ? 'Cancelada pelo motorista' : c.canceladoPor === 'PASSAGEIRO' ? 'Cancelada pelo passageiro' : c.canceladoPor === 'SISTEMA' ? 'Cancelada pelo sistema' : 'Cancelada'}
                            {c.motivoCancelamento ? `: ${c.motivoCancelamento}` : ''}
                          </div>
                        )}
                      </td>
                      {(podeCancelar || podeFinalizar || podeConfirmarPagamento) && (
                        <td className="data-table__cell">
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(podeConfirmarEmbarqueMotorista || podeConfirmarEmbarquePassageiro) && (
                              <Button
                                id={`btn-embarque-${c.id}`}
                                variant="primary"
                                size="sm"
                                onClick={() => window.dispatchEvent(new CustomEvent('abrir-modal-embarque', { detail: c }))}
                              >
                                Confirmar Embarque
                              </Button>
                            )}
                            {podeConfirmarPagamento && (c.status === 'EM_ANDAMENTO' || c.status === 'CONFIRMADA') && (
                              <Button
                                id={`btn-confirmar-pag-${c.id}`}
                                variant="success"
                                size="sm"
                                onClick={() => { setActionError(''); setCorridaToConfirmarPag(c.id); }}
                              >
                                Confirmar Pagamento
                              </Button>
                            )}
                            {podeAcaoCancelar && (
                              <Button
                                id={`btn-cancelar-${c.id}`}
                                variant="danger"
                                size="sm"
                                onClick={() => { setActionError(''); setMotivoCancelamento(''); setCorridaToCancel(c); }}
                              >
                                {ehPassageiro ? 'Cancelar corrida' : 'Cancelar'}
                              </Button>
                            )}
                            {podeAcaoFinalizar && (
                              <Button
                                id={`btn-finalizar-${c.id}`}
                                variant="secondary"
                                size="sm"
                                onClick={() => { setActionError(''); setCorridaToFinalizar(c.id); }}
                              >
                                Finalizar
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de cancelamento com identificação da corrida e motivo */}
      <Modal
        isOpen={!!corridaCancelamentoObj}
        onClose={() => { if (!cancelando) { setCorridaToCancel(null); setMotivoCancelamento(''); setActionError(''); } }}
        title="Cancelar corrida?"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
            <Button
              variant="ghost"
              disabled={cancelando}
              onClick={() => { setCorridaToCancel(null); setMotivoCancelamento(''); setActionError(''); }}
            >
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={cancelando}
              disabled={ehMotorista && !motivoCancelamento.trim()}
              onClick={handleCancelar}
            >
              Cancelar corrida
            </Button>
          </div>
        }
      >
        {corridaCancelamentoObj && (
          <div>
            {corridaCancelamentoObj.origemNome && (
              <div style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.04))', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 14 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Corrida #{String(corridaCancelamentoObj.id).substring(0, 6)}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <MapPin size={14} aria-hidden="true" /> {corridaCancelamentoObj.origemNome}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <MapPin size={14} aria-hidden="true" /> {corridaCancelamentoObj.destinoNome}
                </div>
                <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
                  {formatarDataHorario(corridaCancelamentoObj.dataHorario)} • {formatarMoeda(corridaCancelamentoObj.valor)}
                </div>
              </div>
            )}

            <label htmlFor="motivo-cancelamento-corrida" style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
              {ehMotorista ? 'Motivo do cancelamento *' : 'Motivo do cancelamento (opcional)'}
            </label>
            <textarea
              id="motivo-cancelamento-corrida"
              value={motivoCancelamento}
              maxLength={MOTIVO_MAX}
              rows={3}
              disabled={cancelando}
              placeholder={ehMotorista ? 'Informe o motivo do cancelamento (mínimo 5 caracteres)...' : 'Informe o motivo caso deseje...'}
              onChange={(e) => { setMotivoCancelamento(e.target.value); setActionError(''); }}
              style={{
                width: '100%',
                resize: 'vertical',
                padding: 10,
                borderRadius: 8,
                background: 'transparent',
                color: 'inherit',
                border: '1px solid var(--border-color, rgba(255,255,255,0.2))',
              }}
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              {MOTIVO_MAX - motivoCancelamento.length} caracteres restantes
            </small>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.5 }}>
              Tem certeza que deseja cancelar esta corrida? Essa ação não pode ser desfeita.
            </p>

            {actionError && (
              <p role="alert" className="form-error" style={{ marginTop: 10 }}>
                {actionError}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de finalização */}
      <ConfirmationModal
        isOpen={!!corridaToFinalizar}
        onClose={() => { setCorridaToFinalizar(null); setActionError(''); }}
        onConfirm={handleFinalizar}
        title="Finalizar corrida?"
        message={actionError || 'Confirmar finalização desta corrida?'}
        confirmText="Finalizar corrida"
        cancelText="Voltar"
        variant="primary"
        loading={finalizando}
      />

      {/* Modal de confirmação de pagamento */}
      <ConfirmationModal
        isOpen={!!corridaToConfirmarPag}
        onClose={() => { setCorridaToConfirmarPag(null); setActionError(''); }}
        onConfirm={handleConfirmarPagamento}
        title="Confirmar recebimento do pagamento?"
        message={actionError || 'Confirme que o pagamento foi recebido presencialmente. A corrida será marcada como FINALIZADA.'}
        confirmText="Confirmar Pagamento"
        cancelText="Voltar"
        variant="primary"
        loading={confirmandoPag}
      />
    </>
  );
};

export default CorridasTabs;
