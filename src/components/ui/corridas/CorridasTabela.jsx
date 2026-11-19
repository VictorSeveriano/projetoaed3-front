import React from 'react';
import EmptyState from '../EmptyState';
import CorridaLinha from './CorridaLinha';
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
          icon={<CalendarOff size={48} strokeWidth={1.5} />}
          title="Nenhuma corrida encontrada"
          description={
            abaAtiva === 'TODAS'
              ? 'Você ainda não possui corridas registradas.'
              : `Nenhuma corrida com status "${labelAba}" encontrada.`
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
      )}
    </div>
  );
};

export default CorridasTabela;
