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
  const [classeSelecionada, setClasseSelecionada] = useState('BASICO');

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
      const payload = acao.tipo === 'aprovar' ? { classe: classeSelecionada } : {};
      await api.patch(`/veiculos/${acao.veiculo.id}/${acao.tipo}`, payload);
      await carregar();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Erro ao processar ação');
    } finally {
      setAcao(null);
      setClasseSelecionada('BASICO');
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
                  <th>Porte / Tipo</th>
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
                    <td className="data-table__cell">{v.porte || '—'} / <Badge label={v.classe || 'N/D'} color="info" /></td>
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
        isOpen={!!acao && acao.tipo === 'rejeitar'}
        onClose={() => setAcao(null)}
        onConfirm={handleConfirmarAcao}
        title="Rejeitar Veículo"
        message={`Tem certeza que deseja rejeitar o veículo ${acao?.veiculo?.marca} ${acao?.veiculo?.modelo}?`}
        confirmText="Sim, Rejeitar"
        cancelText="Cancelar"
        variant="danger"
      />

      {acao && acao.tipo === 'aprovar' && (
        <div className="modal-overlay" onClick={() => setAcao(null)}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Aprovar Veículo e Definir Classe</h2>
              <button className="modal__close" onClick={() => setAcao(null)}>✕</button>
            </div>
            <div className="modal__body">
              <p style={{ marginBottom: '16px' }}>
                Você está aprovando o veículo <strong>{acao.veiculo.marca} {acao.veiculo.modelo}</strong> ({acao.veiculo.placa}).
              </p>
              <div className="input-group">
                <label className="input-label">Classe de Serviço</label>
                <select 
                  className="input-field" 
                  value={classeSelecionada} 
                  onChange={e => setClasseSelecionada(e.target.value)}
                >
                  <option value="BASICO">Básico</option>
                  <option value="NORMAL">Normal</option>
                  <option value="PREMIUM">Premium</option>
                </select>
                <span className="input-hint">A classe afeta a tarifação futura do veículo. O porte informado é {acao.veiculo.porte}.</span>
              </div>
            </div>
            <div className="modal__footer">
              <Button variant="outline" onClick={() => setAcao(null)}>Cancelar</Button>
              <Button variant="success" onClick={handleConfirmarAcao}>Aprovar Veículo</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VeiculosAnalisePage;
