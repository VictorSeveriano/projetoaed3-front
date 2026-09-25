import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import motoistasService from '../../services/motoristas.service';
import { formatarMoeda } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Route, CheckCircle, XCircle, DollarSign, Clock, Target,
} from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const ANOS = [2026, 2025, 2024];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        <p className="chart-tooltip__value">
          {formatter ? formatter(payload[0].value) : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * RelatorioMotoristaPage — Relatório mensal do motorista autenticado.
 *
 * Regras (seção 6):
 * - Km rodados e valor das corridas: somente FINALIZADAS.
 * - Corridas concluídas: contagem de FINALIZADAS.
 * - Corridas canceladas: contagem de CANCELADAS.
 * - Valor nunca chamado de "lucro", "salário" ou "rendimento líquido".
 * - Cálculo feito no backend; aqui apenas exibição.
 */
const RelatorioMotoristaPage = () => {
  const { usuario } = useAuth();
  const hoje = new Date();
  const [mes, setMes]       = useState(hoje.getMonth() + 1); // 1-indexed
  const [ano, setAno]       = useState(hoje.getFullYear());
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const carregar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true); setError(''); setRelatorio(null);
    try {
      const dados = await motoistasService.getRelatorio(usuario.id, mes, ano);
      setRelatorio(dados);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  }, [usuario?.id, mes, ano]);

  useEffect(() => { carregar(); }, [carregar]);

  const periodoLabel = `${MESES[mes - 1]} / ${ano}`;

  return (
    <div className="page animate-fade-in">
      <Header
        title="Relatório Mensal"
        subtitle="Desempenho das suas corridas no mês selecionado"
      />

      {/* Filtro de período */}
      <div className="relatorio-filtro card">
        <div className="card__body">
          <div className="relatorio-filtro__campos">
            <div className="input-group">
              <label className="input-label" htmlFor="select-mes-relatorio">Mês</label>
              <select
                id="select-mes-relatorio"
                className="input-field input-field--select"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                aria-label="Selecionar mês do relatório"
              >
                {MESES.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="select-ano-relatorio">Ano</label>
              <select
                id="select-ano-relatorio"
                className="input-field input-field--select"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                aria-label="Selecionar ano do relatório"
              >
                {ANOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && <Loading message={`Carregando relatório de ${periodoLabel}...`} />}

      {error && (
        <div className="form-error" role="alert">{error}</div>
      )}

      {!loading && !error && relatorio && (
        <>
          {/* Indicadores principais */}
          <div className="stats-grid">
            <StatCard
              icon={<Target size={28} />}
              label="Total de Corridas"
              value={relatorio.totalCorridas}
              color="primary"
            />
            <StatCard
              icon={<CheckCircle size={28} />}
              label="Concluídas"
              value={relatorio.corridasConcluidas}
              color="success"
            />
            <StatCard
              icon={<XCircle size={28} />}
              label="Canceladas"
              value={relatorio.corridasCanceladas}
              color="danger"
            />
            <StatCard
              icon={<Route size={28} />}
              label="Km Rodados"
              value={`${relatorio.kmRodados} km`}
              color="accent"
            />
            <StatCard
              icon={<DollarSign size={28} />}
              label="Valor das corridas"
              value={formatarMoeda(relatorio.valorTotal)}
              color="warning"
            />
            <StatCard
              icon={<DollarSign size={28} />}
              label="Valor médio por corrida"
              value={formatarMoeda(relatorio.valorMedioPorCorrida)}
              color="muted"
            />
            <StatCard
              icon={<Route size={28} />}
              label="Distância média"
              value={`${relatorio.distanciaMedia} km`}
              color="accent"
            />
            <StatCard
              icon={<Clock size={28} />}
              label="Duração total"
              value={`${relatorio.duracaoTotalMin} min`}
              color="primary"
            />
          </div>

          {/* Gráfico de corridas por dia */}
          {relatorio.corridasPorDia && relatorio.corridasPorDia.length > 0 ? (
            <ChartCard
              title={`Corridas por dia — ${periodoLabel}`}
              loading={false}
              error={false}
              empty={false}
              className="dashboard-grid__full"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={relatorio.corridasPorDia} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="dia" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip formatter={(v) => `${v} corrida(s)`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="quantidade" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            /* Mensagem explícita quando não há dados — nunca gráfico zerado sem explicação */
            <div className="card">
              <div className="card__body">
                <p className="relatorio-vazio" role="status">
                  Não há corridas registradas em {periodoLabel}. Selecione outro período para ver o relatório.
                </p>
              </div>
            </div>
          )}

          {/* Nota sobre o valor */}
          <div className="relatorio-nota card">
            <div className="card__body">
              <p className="relatorio-nota__texto">
                Os valores apresentados referem-se ao total cobrado pelas corridas concluídas no período.
                Dados de comissão e custos operacionais não estão incluídos.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Estado sem dados após carregar */}
      {!loading && !error && relatorio && relatorio.totalCorridas === 0 && (
        <div className="card">
          <div className="card__body">
            <p className="relatorio-vazio" role="status">
              Não há corridas concluídas em {periodoLabel}. Selecione outro período ou aguarde corridas finalizadas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatorioMotoristaPage;
