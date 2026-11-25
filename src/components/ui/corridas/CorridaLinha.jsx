import React from 'react';
import Badge from '../Badge';
import CorridaAcoes from './CorridaAcoes';
import BadgePontualidade from './BadgePontualidade';
import { FORMA_PAGAMENTO_LABELS, descreverCancelamento } from './corridaPermissoes';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';
import { calcularDuracaoEfetivaMin } from '../../../utils/indicadorAtrasoCorrida';
import { Route, Clock } from 'lucide-react';

const CorridaLinha = ({
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

  const duracaoEfetiva =
    corrida.duracaoEfetivaMin != null
      ? corrida.duracaoEfetivaMin
      : calcularDuracaoEfetivaMin(corrida);

  const dataEfetivaRef =
    corrida.finalizadaEm ||
    corrida.canceladaEm ||
    (corrida.embarqueMotoristaConfirmado === true ? corrida.embarqueMotoristaEm : null);

  const ehAdmin = permissoes?.perfil === 'ADMINISTRADOR';
  const ehMotorista = permissoes?.perfil === 'MOTORISTA';
  const ehPassageiro = permissoes?.perfil === 'USUARIO';

  const placaVeiculo = corrida.veiculo?.placa ? ` • ${corrida.veiculo.placa}` : '';

  return (
    <tr className="data-table__row">
      <td className="data-table__cell">
        <span className="data-table__id">#{String(corrida.id).substring(0, 6)}</span>
        <span className="data-table__sub tabular-nums" title="Data e horário programados">
          Prog.: {formatarDataHorario(corrida.dataHorario)}
        </span>
        {dataEfetivaRef && (
          <span className="data-table__sub tabular-nums" title="Horário efetivo registrado">
            Efet.: {formatarDataHorario(dataEfetivaRef)}
          </span>
        )}
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
          <div className="corridas-metrics-inline">
            {corrida.distanciaKm != null && (
              <span className="corridas-metric">
                <Route size={12} aria-hidden="true" />
                {corrida.distanciaKm} km
              </span>
            )}
            {(corrida.duracaoMin != null || duracaoEfetiva != null) && (
              <span className="corridas-metric">
                <Clock size={12} aria-hidden="true" />
                {duracaoEfetiva != null
                  ? `${duracaoEfetiva} min efet.${corrida.duracaoMin != null ? ` (prev. ${corrida.duracaoMin}m)` : ''}`
                  : `${corrida.duracaoMin} min prev.`}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="data-table__cell">
        <div>
          {nomeVeiculo}
          {placaVeiculo && <span className="data-table__id">{placaVeiculo}</span>}
        </div>
        {(ehAdmin || ehPassageiro) && corrida.motorista?.nome && (
          <span className="data-table__sub">Mot.: {corrida.motorista.nome}</span>
        )}
        {(ehAdmin || ehMotorista) && corrida.passageiro?.nome && (
          <span className="data-table__sub">Pass.: {corrida.passageiro.nome}</span>
        )}
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
          <div className="corrida-status-badges">
            <Badge label={statusInfo.label} color={statusInfo.color} dot />
            <BadgePontualidade corrida={corrida} exibirNotaInicioAtrasado />
          </div>
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
            onAbrirDetalhes={onAbrirDetalhes}
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
