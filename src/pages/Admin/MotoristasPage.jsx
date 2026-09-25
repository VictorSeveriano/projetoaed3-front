import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { ModalPerfilMotorista, ModalPerfilVeiculo } from '../../components/ui/ModaisPerfil';
import api from '../../services/api';
import { Users } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const MotoristasPage = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [modalVeiculoOpen, setModalVeiculoOpen] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);

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

  const handleSaveClasse = async (id, classe) => {
    try {
      await api.patch(`/veiculos/${id}/classe`, { classe });
      await carregar(); // Recarrega os motoristas para refletir a nova classe do veículo
      // Atualiza o veículo selecionado no modal para refletir imediatamente sem fechar
      setVeiculoSelecionado(prev => ({ ...prev, classe }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Erro ao salvar classe do veículo.');
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
                  <td className="data-table__cell">
                    {m.usuario?.nome ? (
                      <button 
                        className="btn-link"
                        onClick={() => {
                          setMotoristaSelecionado(m);
                          setModalOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                      >
                        {m.usuario.nome}
                      </button>
                    ) : '—'}
                  </td>
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

      <ModalPerfilMotorista 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        motorista={{
          ...motoristaSelecionado,
          onOpenVeiculo: () => {
            setVeiculoSelecionado(motoristaSelecionado.veiculo);
            setModalVeiculoOpen(true);
            setModalOpen(false); // Fecha o de motorista ao abrir o de veículo
          }
        }} 
      />

      <ModalPerfilVeiculo
        isOpen={modalVeiculoOpen}
        onClose={() => setModalVeiculoOpen(false)}
        veiculo={veiculoSelecionado}
        isAdmin={true}
        onSaveClasse={handleSaveClasse}
      />
    </div>
  );
};

export default MotoristasPage;
