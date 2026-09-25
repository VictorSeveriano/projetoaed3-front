import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import api from '../../services/api';
import { UserCheck } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const MotoristasAnalisePage = () => {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState(null); // { tipo: 'aprovar' | 'rejeitar', motorista: obj }

  const carregar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/motoristas/analise');
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
      await api.patch(`/motoristas/${acao.motorista.id}/${acao.tipo}`);
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
        <Header title="Análise de Motoristas" subtitle="Aprove ou rejeite solicitações de cadastro" />

        {loading ? (
          <Loading message="Buscando solicitações..." />
        ) : pendentes.length === 0 ? (
          <EmptyState
            icon={<UserCheck size={48} strokeWidth={1.5} />}
            title="Tudo em dia!"
            description="Não há nenhuma solicitação pendente no momento."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Usuário</th>
                  <th>CNH</th>
                  <th>Data Solicitação</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map(m => (
                  <tr key={m.id} className="data-table__row">
                    <td className="data-table__cell">{m.usuario?.nome || '—'}</td>
                    <td className="data-table__cell">@{m.usuario?.usuario || '—'}</td>
                    <td className="data-table__cell">{m.cnh}</td>
                    <td className="data-table__cell">{formatarData(m.criadoEm)}</td>
                    <td className="data-table__cell">
                      <Badge label="Pendente" color="warning" />
                    </td>
                    <td className="data-table__cell">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button size="sm" variant="success" onClick={() => setAcao({ tipo: 'aprovar', motorista: m })}>Aprovar</Button>
                        <Button size="sm" variant="danger" onClick={() => setAcao({ tipo: 'rejeitar', motorista: m })}>Rejeitar</Button>
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
        title={acao?.tipo === 'aprovar' ? 'Aprovar Motorista' : 'Rejeitar Motorista'}
        message={`Tem certeza que deseja ${acao?.tipo} a solicitação de ${acao?.motorista?.usuario?.nome}?`}
        confirmText={acao?.tipo === 'aprovar' ? 'Sim, Aprovar' : 'Sim, Rejeitar'}
        cancelText="Cancelar"
        variant={acao?.tipo === 'aprovar' ? 'primary' : 'danger'}
      />
    </>
  );
};

export default MotoristasAnalisePage;
