import React, { useState, useMemo } from 'react';
import Badge from './Badge';
import Button from './Button';
import EmptyState from './EmptyState';
import ConfirmationModal from './ConfirmationModal';
import corridasService from '../../services/corridas.service';
import veiculosService from '../../services/veiculos.service';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../utils/formatters';
import { CalendarOff, MapPin, Clock, Route } from 'lucide-react';

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
const CorridasTabs = ({
  corridas = [],
  carrosMap = {},
  loading = false,
  error = '',
  podeCancelar = false,
  podeFinalizar = false,
  podeConfirmarPagamento = false, // Motorista: confirma pagamento após corrida
  motoristaUsuarioId = null,       // ID do usuário motorista para confirmar pagamento
  onAcao,
}) => {
  const [abaAtiva, setAbaAtiva]           = useState('TODAS');
  const [corridaToCancel, setCorridaToCancel] = useState(null);
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

  const handleCancelar = async () => {
    if (!corridaToCancel) return;
    setCancelando(true); setActionError('');
    try {
      await corridasService.cancelar(corridaToCancel);
      setCorridaToCancel(null);
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
      await corridasService.confirmarPagamento(corridaToConfirmarPag, motoristaUsuarioId);
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
                  const podeAcaoCancelar = podeCancelar && (c.status === 'SOLICITADA' || c.status === 'CONFIRMADA');
                  const podeAcaoFinalizar = podeFinalizar && (c.status === 'CONFIRMADA' || c.status === 'EM_ANDAMENTO');
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
                      </td>
                      {(podeCancelar || podeFinalizar || podeConfirmarPagamento) && (
                        <td className="data-table__cell">
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {podeAcaoCancelar && (
                              <Button
                                id={`btn-cancelar-${c.id}`}
                                variant="danger"
                                size="sm"
                                onClick={() => { setActionError(''); setCorridaToCancel(c.id); }}
                              >
                                Cancelar
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

      {/* Modal de cancelamento */}
      <ConfirmationModal
        isOpen={!!corridaToCancel}
        onClose={() => { setCorridaToCancel(null); setActionError(''); }}
        onConfirm={handleCancelar}
        title="Cancelar corrida?"
        message={actionError || 'Tem certeza que deseja cancelar esta corrida? Essa ação não pode ser desfeita.'}
        confirmText="Cancelar corrida"
        cancelText="Voltar"
        variant="danger"
        loading={cancelando}
      />

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
