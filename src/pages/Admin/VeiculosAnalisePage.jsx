import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import api from '../../services/api';
import { Car } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const VeiculosAnalisePage = () => {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState(null); // { tipo: 'aprovar' | 'rejeitar', veiculo: obj }

  const carregar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/veiculos/analise');
      setPendentes(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleConfirmarAcao = async () => {
    if (!acao) return;
    try {
      await api.patch(`/veiculos/${acao.veiculo.id}/${acao.tipo}`);
      await carregar();
    } catch (err) {
      console.error(err);
    } finally {
      setAcao(null);
    }
  };

  return (
    <>
      <div className="page animate-fade-in">
        <Header title="Análise de Veículos" subtitle="Aprove ou rejeite veículos de motoristas" />

        {loading ? (
          <Loading message="Buscando veículos pendentes..." />
        ) : pendentes.length === 0 ? (
          <EmptyState
            icon={<Car size={48} strokeWidth={1.5} />}
            title="Nenhum veículo pendente"
            description="Não há veículos aguardando análise no momento."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modelo/Marca</th>
                  <th>Placa</th>
                  <th>Categoria</th>
                  <th>Motorista</th>
                  <th>Data Cadastro</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map(v => (
                  <tr key={v.id} className="data-table__row">
                    <td className="data-table__cell">{v.marca} {v.modelo}</td>
                    <td className="data-table__cell">{v.placa}</td>
                    <td className="data-table__cell">{v.categoria}</td>
                    <td className="data-table__cell">{v.motorista?.nome || '—'}</td>
                    <td className="data-table__cell">{formatarData(v.criadoEm)}</td>
                    <td className="data-table__cell">
                      <Badge label="Pendente" color="warning" />
                    </td>
                    <td className="data-table__cell">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button size="sm" variant="success" onClick={() => setAcao({ tipo: 'aprovar', veiculo: v })}>Aprovar</Button>
                        <Button size="sm" variant="danger" onClick={() => setAcao({ tipo: 'rejeitar', veiculo: v })}>Rejeitar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!acao}
        onClose={() => setAcao(null)}
        onConfirm={handleConfirmarAcao}
        title={acao?.tipo === 'aprovar' ? 'Aprovar Veículo' : 'Rejeitar Veículo'}
        message={`Tem certeza que deseja ${acao?.tipo} o veículo ${acao?.veiculo?.marca} ${acao?.veiculo?.modelo}?`}
        confirmText={acao?.tipo === 'aprovar' ? 'Sim, Aprovar' : 'Sim, Rejeitar'}
        cancelText="Cancelar"
        variant={acao?.tipo === 'aprovar' ? 'primary' : 'danger'}
      />
    </>
  );
};

export default VeiculosAnalisePage;
