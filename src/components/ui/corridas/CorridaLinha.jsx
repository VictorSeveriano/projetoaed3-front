import React from 'react';
import Badge from '../Badge';
import CorridaAcoes from './CorridaAcoes';
import { FORMA_PAGAMENTO_LABELS, descreverCancelamento } from './corridaPermissoes';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';
import { MapPin, Route } from 'lucide-react';

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

  return (
    <tr className="data-table__row">
      <td className="data-table__cell">#{corrida.id.substring(0, 6)}</td>
      <td className="data-table__cell">
        <span className="corridas-local">
          <MapPin size={12} aria-hidden="true" />
          {corrida.origemNome}
        </span>
      </td>
      <td className="data-table__cell">
        <span className="corridas-local">
          <MapPin size={12} aria-hidden="true" />
          {corrida.destinoNome}
        </span>
      </td>
      <td className="data-table__cell">{formatarDataHorario(corrida.dataHorario)}</td>
      <td className="data-table__cell">
        <span className="corridas-metric">
          <Route size={12} aria-hidden="true" />
          {corrida.distanciaKm} km
        </span>
      </td>
      <td className="data-table__cell">{formatarMoeda(corrida.valor)}</td>
      <td className="data-table__cell">
        <Badge
          label={corrida.classe || 'NORMAL'}
          color={corrida.classe === 'PREMIUM' ? 'warning' : corrida.classe === 'BASICO' ? 'muted' : 'info'}
        />
      </td>
      <td className="data-table__cell" style={{ fontSize: '0.82rem' }}>
        {FORMA_PAGAMENTO_LABELS[corrida.formaPagamento] || corrida.formaPagamento || '—'}
      </td>
      <td className="data-table__cell">{nomeVeiculo}</td>
      <td className="data-table__cell">
        <Badge label={statusInfo.label} color={statusInfo.color} />
        {corrida.status === 'CONFIRMADA' && corrida.situacaoMotorista === 'A_CAMINHO' && (
          <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--color-warning)' }}>Motorista a caminho</div>
        )}
        {corrida.status === 'EM_ANDAMENTO' && corrida.embarqueMotoristaConfirmado && (
          <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-secondary)' }}>Embarque confirmado</div>
        )}
        {motivoCancelamentoTexto && (
          <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-secondary)', maxWidth: 240 }}>
            {motivoCancelamentoTexto}
          </div>
        )}
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
