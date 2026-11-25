import React from 'react';
import EmptyState from '../EmptyState';
import CorridaLinha from './CorridaLinha';
import CorridaCard from './CorridaCard';
import { ABAS_CORRIDA } from './corridaPermissoes';
import { CalendarOff } from 'lucide-react';

const CorridasTabela = ({
  corridas,
  abaAtiva = 'TODAS',
  carrosMap = {},
  permissoes,
  emptyTitle = 'Nenhuma corrida encontrada',
  emptyDescription = '',
  onAbrirDetalhes,
  onAbrirCancelar,
  onAbrirConfirmarPagamento,
  onAbrirFinalizar,
}) => {
  const exibirColunaAcoes = Boolean(
    typeof onAbrirDetalhes === 'function' ||
      permissoes.podeCancelar ||
      permissoes.podeFinalizar ||
      permissoes.podeConfirmarPagamento
  );
  const labelAba = ABAS_CORRIDA.find((a) => a.key === abaAtiva)?.label || 'Corridas';

  const nomeVeiculo = (corrida) => {
    if (corrida?.veiculo) {
      return `${corrida.veiculo.marca} ${corrida.veiculo.modelo}`;
    }
    if (!corrida?.veiculoId) return '—';
    const v = carrosMap[corrida.veiculoId];
    return v ? `${v.marca} ${v.modelo}` : `#${String(corrida.veiculoId).slice(0, 6)}`;
  };

  const descricaoVazia =
    emptyDescription ||
    (abaAtiva === 'TODAS'
      ? 'Não há corridas registradas para a visão e os filtros selecionados.'
      : `Nenhuma corrida com status "${labelAba}" encontrada.`);

  return (
    <div role="region" aria-label={`Listagem de corridas: ${labelAba}`}>
      {corridas.length === 0 ? (
        <EmptyState
          icon={<CalendarOff size={32} strokeWidth={1.5} />}
          title={emptyTitle}
          description={descricaoVazia}
        />
      ) : (
        <>
          <div className="table-wrapper table-desktop-only">
            <table className="data-table" role="table">
              <thead>
                <tr>
                  <th scope="col">ID / Horários</th>
                  <th scope="col">Trajeto / Duração</th>
                  <th scope="col">Veículo / Envolvidos</th>
                  <th scope="col">Valor / Pagamento</th>
                  <th scope="col">Status / Situação</th>
                  {exibirColunaAcoes && <th scope="col">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {corridas.map((c) => (
                  <CorridaLinha
                    key={c.id}
                    corrida={c}
                    nomeVeiculo={nomeVeiculo(c)}
                    permissoes={permissoes}
                    exibirColunaAcoes={exibirColunaAcoes}
                    onAbrirDetalhes={onAbrirDetalhes}
                    onAbrirCancelar={onAbrirCancelar}
                    onAbrirConfirmarPagamento={onAbrirConfirmarPagamento}
                    onAbrirFinalizar={onAbrirFinalizar}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards-list cards-mobile-only">
            {corridas.map((c) => (
              <CorridaCard
                key={c.id}
                corrida={c}
                nomeVeiculo={nomeVeiculo(c)}
                permissoes={permissoes}
                exibirColunaAcoes={exibirColunaAcoes}
                onAbrirDetalhes={onAbrirDetalhes}
                onAbrirCancelar={onAbrirCancelar}
                onAbrirConfirmarPagamento={onAbrirConfirmarPagamento}
                onAbrirFinalizar={onAbrirFinalizar}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CorridasTabela;
