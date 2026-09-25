import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import Loading from '../../components/ui/Loading';
import motoistasService from '../../services/motoristas.service';
import { formatarMoeda } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Target, CheckCircle, Route, DollarSign } from 'lucide-react';

/**
 * InicioMotoristaPage — Página inicial do motorista.
 *
 * Exibe resumo do mês atual: totais de corridas, km rodados e
 * valor das corridas. Dados vindos do RelatorioMotoristaService.
 */
const InicioMotoristaPage = () => {
  const { usuario } = useAuth();
  const hoje = new Date();
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!usuario?.id) return;
    motoistasService
      .getRelatorio(usuario.id, hoje.getMonth() + 1, hoje.getFullYear())
      .then((dados) => setResumo(dados))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar resumo.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  return (
    <div className="page animate-fade-in">
      <Header
        title={`Olá, ${usuario?.nome?.split(' ')[0] || 'Motorista'}`}
        subtitle={`Resumo de ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
      />

      {loading && <Loading message="Carregando resumo..." />}
      {error && <div className="form-error" role="alert">{error}</div>}

      {!loading && !error && resumo && (
        <div className="stats-grid">
          <StatCard
            icon={<Target size={28} />}
            label="Corridas no mês"
            value={resumo.totalCorridas}
            color="primary"
          />
          <StatCard
            icon={<CheckCircle size={28} />}
            label="Concluídas"
            value={resumo.corridasConcluidas}
            color="success"
          />
          <StatCard
            icon={<Route size={28} />}
            label="Km rodados"
            value={`${resumo.kmRodados} km`}
            color="accent"
          />
          <StatCard
            icon={<DollarSign size={28} />}
            label="Valor das corridas"
            value={formatarMoeda(resumo.valorTotal)}
            color="warning"
          />
        </div>
      )}
    </div>
  );
};

export default InicioMotoristaPage;
