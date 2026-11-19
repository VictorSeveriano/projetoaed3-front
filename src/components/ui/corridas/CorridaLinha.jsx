import React from 'react';
import Badge from '../Badge';
import CorridaAcoes from './CorridaAcoes';
import { FORMA_PAGAMENTO_LABELS, descreverCancelamento } from './corridaPermissoes';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';
import { Route } from 'lucide-react';

const CorridaLinha = ({
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

  return (
    <tr className="data-table__row">
      <td className="data-table__cell">
        <span className="data-table__id">#{String(corrida.id).substring(0, 6)}</span>
        <span className="data-table__sub tabular-nums">{formatarDataHorario(corrida.dataHorario)}</span>
      </td>

      <td className="data-table__cell">
        <div className="corridas-trajeto">
          <span className="corridas-local">
            <span className="corridas-pin corridas-pin--origem" aria-hidden="true" />
            <span>{corrida.origemNome}</span>
          </span>
          <span className="corridas-local corridas-local--destino">
            <span className="corridas-pin corridas-pin--destino" aria-hidden="true" />
            <span>{corrida.destinoNome}</span>
          </span>
          {corrida.distanciaKm != null && (
            <span className="corridas-metric">
              <Route size={12} aria-hidden="true" />
              {corrida.distanciaKm} km
            </span>
          )}
        </div>
      </td>

      <td className="data-table__cell">
        <div>{nomeVeiculo}</div>
        <div style={{ marginTop: 4 }}>
          <Badge
            label={corrida.classe || 'NORMAL'}
            color={corrida.classe === 'PREMIUM' ? 'warning' : corrida.classe === 'BASICO' ? 'muted' : 'info'}
          />
        </div>
      </td>

      <td className="data-table__cell">
        <span className="data-table__value">{formatarMoeda(corrida.valor)}</span>
        <span className="data-table__sub">{pagamentoLabel}</span>
      </td>

      <td className="data-table__cell">
        <div className="corrida-status-col">
          <Badge label={statusInfo.label} color={statusInfo.color} dot />
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
      </td>

      {exibirColunaAcoes && (
        <td className="data-table__cell">
          <CorridaAcoes
            corrida={corrida}
            permissoes={permissoes}
            onAbrirCancelar={onAbrirCancelar}
            onAbrirConfirmarPagamento={onAbrirConfirmarPagamento}
            onAbrirFinalizar={onAbrirFinalizar}
          />
        </td>
      )}
    </tr>
  );
};

export default CorridaLinha;
