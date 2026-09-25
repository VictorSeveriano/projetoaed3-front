import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import { Users } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const MotoristasPage = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/motoristas');
      setMotoristas(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APROVADO': return <Badge label="Aprovado" color="success" />;
      case 'PENDENTE': return <Badge label="Pendente" color="warning" />;
      case 'REJEITADO': return <Badge label="Rejeitado" color="danger" />;
      default: return <Badge label={status} color="muted" />;
    }
  };

  return (
    <div className="page animate-fade-in">
      <Header title="Motoristas" subtitle="Visão geral de todos os motoristas cadastrados" />

      {loading ? (
        <Loading message="Carregando motoristas..." />
      ) : motoristas.length === 0 ? (
        <EmptyState
          icon={<Users size={48} strokeWidth={1.5} />}
          title="Nenhum motorista"
          description="Ainda não existem motoristas registrados."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Usuário</th>
                <th>CNH</th>
                <th>Cadastro</th>
                <th>Status</th>
                <th>Presença</th>
              </tr>
            </thead>
            <tbody>
              {motoristas.map(m => (
                <tr key={m.id} className="data-table__row">
                  <td className="data-table__cell">{m.usuario?.nome || '—'}</td>
                  <td className="data-table__cell">@{m.usuario?.usuario || '—'}</td>
                  <td className="data-table__cell">{m.cnh}</td>
                  <td className="data-table__cell">{formatarData(m.criadoEm)}</td>
                  <td className="data-table__cell">{getStatusBadge(m.statusCadastro)}</td>
                  <td className="data-table__cell">
                    {m.statusCadastro === 'APROVADO' && (
                      <Badge label={m.statusPresenca} color={m.statusPresenca === 'ONLINE' ? 'info' : 'muted'} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MotoristasPage;
