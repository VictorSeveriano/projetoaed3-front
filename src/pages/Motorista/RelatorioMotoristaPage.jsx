import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import StatCard from '../../components/ui/StatCard';
import ChartCard, { ChartTooltip } from '../../components/ui/ChartCard';
import motoristasService from '../../services/motoristas.service';
import { formatarMoeda } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Route, CheckCircle, XCircle, DollarSign, Clock, Target, TriangleAlert,
} from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const ANOS = [2026, 2025, 2024];

/**
 * RelatorioMotoristaPage — Relatório mensal do motorista autenticado.
 */
const RelatorioMotoristaPage = () => {
  const { usuario } = useAuth();
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1); // 1-indexed
  const [ano, setAno] = useState(hoje.getFullYear());
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carregar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    setError('');
    setRelatorio(null);
    try {
      const dados = await motoristasService.getRelatorio(usuario.id, mes, ano);
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
        <div className="form-error" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && relatorio && (
        <>
          <div className="stats-grid">
            <StatCard
              icon={<DollarSign size={22} />}
              label="Valor das corridas"
              value={formatarMoeda(relatorio.valorTotal)}
              color="success"
              featured
            />
            <StatCard
              icon={<Target size={22} />}
              label="Total de Corridas"
              value={relatorio.totalCorridas}
              color="primary"
            />
            <StatCard
              icon={<CheckCircle size={22} />}
              label="Concluídas"
              value={relatorio.corridasConcluidas}
              color="success"
            />
            <StatCard
              icon={<XCircle size={22} />}
              label="Canceladas"
              value={relatorio.corridasCanceladas}
              color="danger"
            />
            <StatCard
              icon={<Route size={22} />}
              label="Km Rodados"
              value={`${relatorio.kmRodados} km`}
              color="accent"
            />
            <StatCard
              icon={<DollarSign size={22} />}
              label="Valor médio por corrida"
              value={formatarMoeda(relatorio.valorMedioPorCorrida)}
              color="muted"
            />
            <StatCard
              icon={<Route size={22} />}
              label="Distância média"
              value={`${relatorio.distanciaMedia} km`}
              color="accent"
            />
            <StatCard
              icon={<Clock size={22} />}
              label="Duração total"
              value={`${relatorio.duracaoTotalMin} min`}
              color="primary"
            />
          </div>

          {relatorio.corridasPorDia && relatorio.corridasPorDia.length > 0 ? (
            <ChartCard
              title={`Corridas por dia — ${periodoLabel}`}
              subtitle="Distribuição diária de corridas no período"
              loading={false}
              error={false}
              empty={false}
              className="dashboard-grid__full"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={relatorio.corridasPorDia} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
                  <XAxis dataKey="dia" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v} corrida(s)`} />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                  <Bar dataKey="quantidade" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <div className="card">
              <div className="card__body">
                <p className="relatorio-vazio" role="status">
                  Não há corridas registradas em {periodoLabel}. Selecione outro período para ver o relatório.
                </p>
              </div>
            </div>
          )}

          <div className="relatorio-nota card card--subtle">
            <div className="card__body">
              <p className="relatorio-nota__texto">
                Os valores apresentados referem-se ao total cobrado pelas corridas concluídas no período.
                Dados de comissão e custos operacionais não estão incluídos.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RelatorioMotoristaPage;
