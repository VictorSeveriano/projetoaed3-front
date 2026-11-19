import React from 'react';
import EmptyState from '../EmptyState';
import CorridaLinha from './CorridaLinha';
import CorridaCard from './CorridaCard';
import { ABAS_CORRIDA } from './corridaPermissoes';
import { CalendarOff } from 'lucide-react';

const CorridasTabela = ({
  corridas,
  abaAtiva,
  carrosMap,
  permissoes,
  onAbrirCancelar,
  onAbrirConfirmarPagamento,
  onAbrirFinalizar,
}) => {
  const exibirColunaAcoes = Boolean(
    permissoes.podeCancelar || permissoes.podeFinalizar || permissoes.podeConfirmarPagamento
  );
  const labelAba = ABAS_CORRIDA.find((a) => a.key === abaAtiva)?.label;

  const nomeVeiculo = (veiculoId) => {
    if (!veiculoId) return '—';
    const v = carrosMap[veiculoId];
    return v ? `${v.marca} ${v.modelo}` : `#${veiculoId}`;
  };

  return (
    <div role="tabpanel" aria-label={`Corridas: ${labelAba}`}>
      {corridas.length === 0 ? (
        <EmptyState
          icon={<CalendarOff size={32} strokeWidth={1.5} />}
          title="Nenhuma corrida encontrada"
          description={
            abaAtiva === 'TODAS'
              ? 'Você ainda não possui corridas registradas.'
              : `Nenhuma corrida com status "${labelAba}" encontrada.`
          }
        />
      ) : (
        <>
          <div className="table-wrapper table-desktop-only">
            <table className="data-table" role="table">
              <thead>
                <tr>
                  <th scope="col">ID / Data</th>
                  <th scope="col">Trajeto</th>
                  <th scope="col">Veículo / Classe</th>
                  <th scope="col">Valor / Pagamento</th>
                  <th scope="col">Status</th>
                  {exibirColunaAcoes && <th scope="col">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {corridas.map((c) => (
                  <CorridaLinha
                    key={c.id}
                    corrida={c}
                    nomeVeiculo={nomeVeiculo(c.veiculoId)}
                    permissoes={permissoes}
                    exibirColunaAcoes={exibirColunaAcoes}
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
                nomeVeiculo={nomeVeiculo(c.veiculoId)}
                permissoes={permissoes}
                exibirColunaAcoes={exibirColunaAcoes}
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
