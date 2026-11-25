import React, { useEffect, useState, useCallback } from 'react';
import Modal from '../Modal';
import Badge from '../Badge';
import Button from '../Button';
import Loading from '../Loading';
import BadgePontualidade from './BadgePontualidade';
import CorridaTimeline from './CorridaTimeline';
import corridasService from '../../../services/corridas.service';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';
import { FORMA_PAGAMENTO_LABELS } from './corridaPermissoes';
import { RefreshCw, TriangleAlert, Route, Clock, Car, User } from 'lucide-react';

const RESPONSAVEL_CANCELAMENTO_LABELS = {
  MOTORISTA: 'Motorista',
  PASSAGEIRO: 'Passageiro',
  SISTEMA: 'Sistema automático / Administração',
};

/**
 * ModalDetalhesCorrida — Consulta sob demanda dos detalhes completos, horários
 * programados x efetivos e linha do tempo cronológica da corrida.
 */
const ModalDetalhesCorrida = ({ corridaId, corridaInicial = null, isOpen, onClose }) => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const carregarDetalhes = useCallback(
    async (forcar = false) => {
      if (!corridaId) return;
      setLoading(true);
      setErro('');
      try {
        const resposta = await corridasService.obterLinhaDoTempo(corridaId, { forcar });
        setDados(resposta);
      } catch (err) {
        setErro(
          err?.response?.data?.message ||
            err?.message ||
            'Não foi possível carregar os detalhes e a linha do tempo desta corrida.'
        );
      } finally {
        setLoading(false);
      }
    },
    [corridaId]
  );

  useEffect(() => {
    if (isOpen && corridaId) {
      carregarDetalhes(false);
    } else if (!isOpen) {
      setDados(null);
      setErro('');
    }
  }, [isOpen, corridaId, carregarDetalhes]);

  const corrida = dados?.corrida || corridaInicial;
  const eventos = dados?.eventos || [];
  const statusInfo = corrida
    ? STATUS_LABELS[corrida.status] || { label: corrida.status, color: 'muted' }
    : null;
  const pagamentoLabel = corrida
    ? FORMA_PAGAMENTO_LABELS[corrida.formaPagamento] || corrida.formaPagamento || '—'
    : '—';

  const veiculoTexto = corrida?.veiculo
    ? `${corrida.veiculo.marca} ${corrida.veiculo.modelo}${corrida.veiculo.placa ? ` • Placa ${corrida.veiculo.placa}` : ''}`
    : 'Não vinculado';

  const terminoEfetivo = corrida?.finalizadaEm || corrida?.canceladaEm || null;
  const rotuloTerminoEfetivo =
    corrida?.status === 'CANCELADA' ? 'Cancelada/Expirada em' : 'Finalização efetiva';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={corrida ? `Corrida #${String(corrida.id).slice(0, 8)}` : 'Detalhes da corrida'}
      size="lg"
      footer={
        <div className="modal-actions">
          {corridaId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => carregarDetalhes(true)}
              disabled={loading}
            >
              <RefreshCw size={15} aria-hidden="true" />
              Atualizar
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      {loading && !dados ? (
        <Loading message="Carregando detalhes e linha do tempo..." />
      ) : erro ? (
        <div className="corrida-detalhes-erro">
          <div className="form-error" role="alert">
            <TriangleAlert size={16} aria-hidden="true" />
            <span>{erro}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => carregarDetalhes(true)}>
            Tentar novamente
          </Button>
        </div>
      ) : corrida ? (
        <div className="corrida-detalhes">
          {/* Cabeçalho de status, pontualidade e valor */}
          <div className="corrida-detalhes__status-bar">
            <div className="corrida-detalhes__badges">
              {statusInfo && <Badge label={statusInfo.label} color={statusInfo.color} dot />}
              <BadgePontualidade corrida={corrida} sempreVisivel exibirNotaInicioAtrasado />
              <Badge label={`Classe ${corrida.classe || 'NORMAL'}`} color="info" />
            </div>
            <div className="corrida-detalhes__price-box">
              <span className="corrida-detalhes__price">{formatarMoeda(corrida.valor)}</span>
              <span className="corrida-detalhes__payment">{pagamentoLabel}</span>
            </div>
          </div>

          {/* Trajeto */}
          <div className="corrida-detalhes__route-card">
            <div className="corridas-local">
              <span className="corridas-pin corridas-pin--origem" aria-hidden="true" />
              <div>
                <span className="corrida-detalhes__tiny-label">Origem</span>
                <div className="corrida-detalhes__place">{corrida.origemNome}</div>
              </div>
            </div>
            <div className="corridas-local corridas-local--destino">
              <span className="corridas-pin corridas-pin--destino" aria-hidden="true" />
              <div>
                <span className="corrida-detalhes__tiny-label">Destino</span>
                <div className="corrida-detalhes__place">{corrida.destinoNome}</div>
              </div>
            </div>
            <div className="corrida-detalhes__route-metrics">
              <span>
                <Route size={14} aria-hidden="true" /> Distância: <strong>{corrida.distanciaKm ?? 0} km</strong>
              </span>
              <span>
                <Clock size={14} aria-hidden="true" /> Duração prevista:{' '}
                <strong>{corrida.duracaoMin != null ? `${corrida.duracaoMin} min` : '—'}</strong>
              </span>
              <span>
                <Clock size={14} aria-hidden="true" /> Duração efetiva:{' '}
                <strong>
                  {corrida.duracaoEfetivaMin != null ? `${corrida.duracaoEfetivaMin} min` : '—'}
                </strong>
              </span>
            </div>
          </div>

          {/* Grade de horários e participantes */}
          <div className="auditoria-meta-grid">
            <div className="auditoria-block">
              <span className="auditoria-block__label">Identificador completo</span>
              <div className="data-table__id" style={{ wordBreak: 'break-all' }}>{corrida.id}</div>
            </div>

            <div className="auditoria-block">
              <span className="auditoria-block__label">Data e horário programados</span>
              <div className="tabular-nums" style={{ fontWeight: 600 }}>
                {formatarDataHorario(corrida.dataHorario)}
              </div>
            </div>

            <div className="auditoria-block">
              <span className="auditoria-block__label">Início / Embarque efetivo</span>
              <div className="tabular-nums">
                {corrida.embarqueMotoristaConfirmado === true && corrida.embarqueMotoristaEm
                  ? formatarDataHorario(corrida.embarqueMotoristaEm)
                  : '—'}
              </div>
            </div>

            <div className="auditoria-block">
              <span className="auditoria-block__label">{rotuloTerminoEfetivo}</span>
              <div className="tabular-nums">
                {terminoEfetivo ? formatarDataHorario(terminoEfetivo) : '—'}
              </div>
            </div>

            <div className="auditoria-block">
              <span className="auditoria-block__label">
                <User size={12} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Passageiro
              </span>
              <div>{corrida.passageiro?.nome || '—'}</div>
            </div>

            <div className="auditoria-block">
              <span className="auditoria-block__label">
                <User size={12} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Motorista
              </span>
              <div>{corrida.motorista?.nome || (corrida.motoristaId ? 'Vinculado' : 'Não atribuído')}</div>
            </div>

            <div className="auditoria-block" style={{ gridColumn: '1 / -1' }}>
              <span className="auditoria-block__label">
                <Car size={12} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Veículo utilizado
              </span>
              <div>{veiculoTexto}</div>
            </div>
          </div>

          {/* Motivo e responsável pelo cancelamento, quando aplicável */}
          {corrida.status === 'CANCELADA' && (
            <div className="corrida-detalhes__cancel-box">
              <div className="corrida-detalhes__cancel-title">
                {corrida.pontualidade?.expirada
                  ? 'Expiração automática registrada'
                  : 'Informações do cancelamento'}
              </div>
              <div className="corrida-detalhes__cancel-meta">
                <span>
                  <strong>Responsável:</strong>{' '}
                  {corrida.pontualidade?.expirada
                    ? 'Sistema automático'
                    : RESPONSAVEL_CANCELAMENTO_LABELS[corrida.canceladoPor] || corrida.canceladoPor || '—'}
                </span>
                {corrida.canceladaEm && (
                  <span className="tabular-nums">
                    <strong>Data/Hora:</strong> {formatarDataHorario(corrida.canceladaEm)}
                  </span>
                )}
              </div>
              <p className="corrida-detalhes__cancel-reason">
                <strong>Motivo:</strong> {corrida.motivoCancelamento || 'Não informado'}
              </p>
            </div>
          )}

          {/* Linha do tempo cronológica */}
          <section className="corrida-detalhes__timeline-section" aria-labelledby="titulo-timeline-corrida">
            <h3 id="titulo-timeline-corrida" className="corrida-detalhes__section-title">
              Linha do tempo da corrida ({eventos.length})
            </h3>
            <CorridaTimeline eventos={eventos} />
          </section>
        </div>
      ) : null}
    </Modal>
  );
};

export default ModalDetalhesCorrida;
