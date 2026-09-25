import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import motoistasService from '../../services/motoristas.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABELS, formatarMoeda } from '../../utils/formatters';
import { Car, Tag, Hash, Calendar, DollarSign } from 'lucide-react';

/**
 * MeuVeiculoPage — Veículo associado ao motorista autenticado.
 *
 * Tela separada (não incorporada ao perfil) porque o veículo possui
 * status, categoria e tarifaBase além do que cabe no perfil confortavelmente.
 * Decisão documentada: seção 4 do documento de requisitos.
 */
const MeuVeiculoPage = () => {
  const { usuario } = useAuth();
  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!usuario?.id) return;
    motoistasService.buscarVeiculo(usuario.id)
      .then((dados) => setVeiculo(dados))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar veículo.'))
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  if (loading) return <Loading message="Carregando veículo..." />;

  if (error) {
    return (
      <div className="page animate-fade-in">
        <Header title="Meu Veículo" subtitle="Veículo associado à sua conta" />
        <div className="form-error" role="alert">{error}</div>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="page animate-fade-in">
        <Header title="Meu Veículo" subtitle="Veículo associado à sua conta" />
        <EmptyState
          icon={<Car size={48} strokeWidth={1.5} />}
          title="Nenhum veículo associado"
          description="Você ainda não possui um veículo vinculado à sua conta. Contate o administrador."
        />
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[veiculo.status] || { label: veiculo.status, color: 'muted' };

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Veículo" subtitle="Informações do veículo vinculado à sua conta" />

      <div className="card">
        <div className="card__header">
          <h2 className="card-section-title">Dados do veículo</h2>
        </div>
        <div className="card__body">
          <div className="perfil-grid">
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Car size={18} /></span>
              <div>
                <span className="perfil-campo__label">Modelo</span>
                <span className="perfil-campo__valor">{veiculo.marca} {veiculo.modelo}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Calendar size={18} /></span>
              <div>
                <span className="perfil-campo__label">Ano</span>
                <span className="perfil-campo__valor">{veiculo.ano}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Hash size={18} /></span>
              <div>
                <span className="perfil-campo__label">Placa</span>
                <span className="perfil-campo__valor">{veiculo.placa}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Tag size={18} /></span>
              <div>
                <span className="perfil-campo__label">Categoria</span>
                <span className="perfil-campo__valor">{veiculo.categoria}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><DollarSign size={18} /></span>
              <div>
                <span className="perfil-campo__label">Tarifa base</span>
                <span className="perfil-campo__valor">{formatarMoeda(veiculo.tarifaBase)}/km</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Car size={18} /></span>
              <div>
                <span className="perfil-campo__label">Status</span>
                <Badge label={statusInfo.label} color={statusInfo.color} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuVeiculoPage;
