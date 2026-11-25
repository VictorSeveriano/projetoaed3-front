import React from 'react';
import Badge from '../Badge';
import CorridaAcoes from './CorridaAcoes';
import BadgePontualidade from './BadgePontualidade';
import {
  FORMA_PAGAMENTO_LABELS,
  descreverCancelamento,
  obterAcoesDisponiveisCorrida,
} from './corridaPermissoes';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';
import { calcularDuracaoEfetivaMin } from '../../../utils/indicadorAtrasoCorrida';
import { Route } from 'lucide-react';

/**
 * CorridaCard — Apresentação mobile responsiva de uma corrida e seu histórico.
 */
const CorridaCard = ({
  corrida,
  nomeVeiculo,
  permissoes,
  exibirColunaAcoes,
  onAbrirDetalhes,
  onAbrirCancelar,
  onAbrirConfirmarPagamento,
  onAbrirFinalizar,
}) => {
  const statusInfo = STATUS_LABELS[corrida.status] || { label: corrida.status, color: 'muted' };
  const motivoCancelamentoTexto = descreverCancelamento(corrida);
  const pagamentoLabel = FORMA_PAGAMENTO_LABELS[corrida.formaPagamento] || corrida.formaPagamento || '—';
  const acoesDisp = obterAcoesDisponiveisCorrida(corrida, permissoes);
  const duracaoEfetiva =
    corrida.duracaoEfetivaMin != null
      ? corrida.duracaoEfetivaMin
      : calcularDuracaoEfetivaMin(corrida);

  const temAcoes =
    exibirColunaAcoes &&
    (typeof onAbrirDetalhes === 'function' ||
      acoesDisp.podeConfirmarEmbarque ||
      acoesDisp.podeAcaoConfirmarPagamento ||
      acoesDisp.podeAcaoFinalizar ||
      acoesDisp.podeAcaoCancelar);

  const ehAdmin = permissoes?.perfil === 'ADMINISTRADOR';
  const ehMotorista = permissoes?.perfil === 'MOTORISTA';
  const ehPassageiro = permissoes?.perfil === 'USUARIO';

  return (
    <article className="corrida-card" aria-label={`Corrida ${String(corrida.id).substring(0, 6)}`}>
      <div className="corrida-card__top">
        <div>
          <span className="corrida-card__id">Corrida #{String(corrida.id).substring(0, 6)}</span>
          <span className="corrida-card__date">{formatarDataHorario(corrida.dataHorario)}</span>
        </div>
        <div className="corrida-status-badges">
          <Badge label={statusInfo.label} color={statusInfo.color} dot />
          <BadgePontualidade corrida={corrida} />
        </div>
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
          <span className="corrida-card__meta-value">
            {nomeVeiculo}
            {corrida.veiculo?.placa ? ` (${corrida.veiculo.placa})` : ''}
          </span>
        </div>
        <div className="corrida-card__meta-item">
          <span className="corrida-card__meta-label">Distância / Duração</span>
          <span className="corrida-card__meta-value">
            <span className="corridas-metric" style={{ marginTop: 0 }}>
              <Route size={12} aria-hidden="true" />
              {corrida.distanciaKm} km •{' '}
              {duracaoEfetiva != null
                ? `${duracaoEfetiva} min efet.`
                : corrida.duracaoMin != null
                  ? `${corrida.duracaoMin} min prev.`
                  : corrida.classe || 'NORMAL'}
            </span>
          </span>
        </div>
        {(ehAdmin || ehPassageiro) && corrida.motorista?.nome && (
          <div className="corrida-card__meta-item">
            <span className="corrida-card__meta-label">Motorista</span>
            <span className="corrida-card__meta-value">{corrida.motorista.nome}</span>
          </div>
        )}
        {(ehAdmin || ehMotorista) && corrida.passageiro?.nome && (
          <div className="corrida-card__meta-item">
            <span className="corrida-card__meta-label">Passageiro</span>
            <span className="corrida-card__meta-value">{corrida.passageiro.nome}</span>
          </div>
        )}
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
            onAbrirDetalhes={onAbrirDetalhes}
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
