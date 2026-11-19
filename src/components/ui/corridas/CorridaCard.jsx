import React from 'react';
import Badge from '../Badge';
import CorridaAcoes from './CorridaAcoes';
import {
  FORMA_PAGAMENTO_LABELS,
  descreverCancelamento,
  obterAcoesDisponiveisCorrida,
} from './corridaPermissoes';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';
import { Route } from 'lucide-react';

/**
 * CorridaCard — Apresentação mobile responsiva de uma corrida.
 * Reutiliza integralmente as mesmas regras de permissão, formatação e ações da tabela desktop.
 */
const CorridaCard = ({
  corrida,
  nomeVeiculo,
  permissoes,
  exibirColunaAcoes,
  onAbrirCancelar,
  onAbrirConfirmarPagamento,
  onAbrirFinalizar,
}) => {
  const statusInfo = STATUS_LABELS[corrida.status] || { label: corrida.status, color: 'muted' };
  const motivoCancelamentoTexto = descreverCancelamento(corrida);
  const pagamentoLabel = FORMA_PAGAMENTO_LABELS[corrida.formaPagamento] || corrida.formaPagamento || '—';
  const acoesDisp = obterAcoesDisponiveisCorrida(corrida, permissoes);
  const temAcoes =
    exibirColunaAcoes &&
    (acoesDisp.podeConfirmarEmbarque ||
      acoesDisp.podeAcaoConfirmarPagamento ||
      acoesDisp.podeAcaoFinalizar ||
      acoesDisp.podeAcaoCancelar);

  return (
    <article className="corrida-card" aria-label={`Corrida ${String(corrida.id).substring(0, 6)}`}>
      <div className="corrida-card__top">
        <div>
          <span className="corrida-card__id">Corrida #{String(corrida.id).substring(0, 6)}</span>
          <span className="corrida-card__date">{formatarDataHorario(corrida.dataHorario)}</span>
        </div>
        <Badge label={statusInfo.label} color={statusInfo.color} dot />
      </div>

      <div className="corrida-card__route">
        <span className="corridas-local">
          <span className="corridas-pin corridas-pin--origem" aria-hidden="true" />
          <span>{corrida.origemNome}</span>
        </span>
        <span className="corridas-local corridas-local--destino">
          <span className="corridas-pin corridas-pin--destino" aria-hidden="true" />
          <span>{corrida.destinoNome}</span>
        </span>
      </div>

      <div className="corrida-card__meta">
        <div className="corrida-card__meta-item">
          <span className="corrida-card__meta-label">Valor</span>
          <span className="corrida-card__meta-value corrida-card__meta-value--price">
            {formatarMoeda(corrida.valor)}
          </span>
        </div>
        <div className="corrida-card__meta-item">
          <span className="corrida-card__meta-label">Pagamento</span>
          <span className="corrida-card__meta-value">{pagamentoLabel}</span>
        </div>
        <div className="corrida-card__meta-item">
          <span className="corrida-card__meta-label">Veículo</span>
          <span className="corrida-card__meta-value">{nomeVeiculo}</span>
        </div>
        <div className="corrida-card__meta-item">
          <span className="corrida-card__meta-label">Distância / Classe</span>
          <span className="corrida-card__meta-value">
            <span className="corridas-metric" style={{ marginTop: 0 }}>
              <Route size={12} aria-hidden="true" />
              {corrida.distanciaKm} km • {corrida.classe || 'NORMAL'}
            </span>
          </span>
        </div>
      </div>

      {(corrida.status === 'CONFIRMADA' && corrida.situacaoMotorista === 'A_CAMINHO') ||
      (corrida.status === 'EM_ANDAMENTO' && corrida.embarqueMotoristaConfirmado) ||
      motivoCancelamentoTexto ? (
        <div className="corrida-card__notes">
          {corrida.status === 'CONFIRMADA' && corrida.situacaoMotorista === 'A_CAMINHO' && (
            <span className="corrida-status-note corrida-status-note--warning">
              Motorista a caminho
            </span>
          )}
          {corrida.status === 'EM_ANDAMENTO' && corrida.embarqueMotoristaConfirmado && (
            <span className="corrida-status-note">
              Embarque confirmado
            </span>
          )}
          {motivoCancelamentoTexto && (
            <span className="corrida-status-note">
              {motivoCancelamentoTexto}
            </span>
          )}
        </div>
      ) : null}

      {temAcoes && (
        <div className="corrida-card__actions">
          <CorridaAcoes
            corrida={corrida}
            permissoes={permissoes}
            onAbrirCancelar={onAbrirCancelar}
            onAbrirConfirmarPagamento={onAbrirConfirmarPagamento}
            onAbrirFinalizar={onAbrirFinalizar}
          />
        </div>
      )}
    </article>
  );
};

export default CorridaCard;
