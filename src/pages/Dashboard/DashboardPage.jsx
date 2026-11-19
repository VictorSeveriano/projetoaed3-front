import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import ChartCard, { ChartTooltip } from '../../components/ui/ChartCard';
import dashboardService from '../../services/dashboard.service';
import { formatarMoeda } from '../../utils/formatters';
import { Car, Calendar, DollarSign, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';

const truncarRotulo = (texto, max = 18) => {
  if (!texto) return '';
  const str = String(texto);
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
};

const DashboardPage = () => {
  const [stats, setStats] = useState({ totalCorridas: 0, corridasAtivas: 0, veiculosDisponiveis: 0, faturamentoTotal: 0 });
  const [graficos, setGraficos] = useState({ corridas: [], origens: [], destinos: [], rotas: [], veiculos: [], faturamento: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const [resumoRes, corridasRes, origensRes, destinosRes, rotasRes, veiculosRes, faturamentoRes] = await Promise.all([
          dashboardService.getResumo(),
          dashboardService.getCorridas(),
          dashboardService.getOrigens(),
          dashboardService.getDestinos(),
          dashboardService.getRotas(),
          dashboardService.getVeiculos(),
          dashboardService.getFaturamento(),
        ]);

        setStats(resumoRes.data || {});
        setGraficos({
          corridas: corridasRes.data || [],
          origens: origensRes.data || [],
          destinos: destinosRes.data || [],
          rotas: rotasRes.data || [],
          veiculos: veiculosRes.data || [],
          faturamento: faturamentoRes.data || [],
        });
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page animate-fade-in">
      <Header
        title="Dashboard de Corridas"
        subtitle="Visão geral das corridas solicitadas, faturamento e operação"
      />

      <div className="stats-grid">
        <StatCard
          icon={<DollarSign size={22} />}
          label="Faturamento Total"
          value={formatarMoeda(stats.faturamentoTotal || 0)}
          color="success"
          loading={loading}
          featured
        />
        <StatCard
          icon={<Calendar size={22} />}
          label="Total de Corridas"
          value={stats.totalCorridas}
          color="primary"
          loading={loading}
        />
        <StatCard
          icon={<Target size={22} />}
          label="Corridas Ativas"
          value={stats.corridasAtivas}
          color="warning"
          loading={loading}
        />
        <StatCard
          icon={<Car size={22} />}
          label="Veículos Disponíveis"
          value={stats.veiculosDisponiveis}
          color="accent"
          loading={loading}
        />
      </div>

      <div className="dashboard-grid">
        <ChartCard
          title="Faturamento Mensal"
          subtitle="Evolução do recebimento mensal das corridas concluídas"
          loading={loading}
          error={error}
          empty={!graficos.faturamento.some((d) => d.valor > 0)}
          className="dashboard-grid__full"
        >
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={graficos.faturamento} margin={{ top: 16, right: 16, left: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${value}`}
                width={74}
              />
              <Tooltip content={<ChartTooltip formatter={(val) => formatarMoeda(val)} />} />
              <Area type="monotone" dataKey="valor" stroke="#10b981" fillOpacity={1} fill="url(#colorValor)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Corridas por Mês"
          subtitle="Volume mensal de reservas registradas"
          loading={loading}
          error={error}
          empty={!graficos.corridas.some((d) => d.quantidade > 0)}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={graficos.corridas} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
              <Tooltip content={<ChartTooltip formatter={(val) => `${val} corrida(s)`} />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Bar dataKey="quantidade" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Rotas mais Utilizadas"
          subtitle="Trajetos com maior frequência"
          loading={loading}
          error={error}
          empty={graficos.rotas.length === 0}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={graficos.rotas} layout="vertical" margin={{ top: 8, right: 20, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} allowDecimals={false} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="#94a3b8"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => truncarRotulo(v, 20)}
                width={126}
              />
              <Tooltip content={<ChartTooltip formatter={(val) => `${val} corrida(s)`} />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Bar dataKey="quantidade" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Origens mais Solicitadas"
          subtitle="Locais com maior demanda de embarque"
          loading={loading}
          error={error}
          empty={graficos.origens.length === 0}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={graficos.origens} layout="vertical" margin={{ top: 8, right: 20, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} allowDecimals={false} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="#94a3b8"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => truncarRotulo(v, 18)}
                width={116}
              />
              <Tooltip content={<ChartTooltip formatter={(val) => `${val} solicitações`} />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Bar dataKey="quantidade" fill="#38bdf8" radius={[0, 6, 6, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Veículos mais Alocados"
          subtitle="Carros com maior número de corridas"
          loading={loading}
          error={error}
          empty={graficos.veiculos.length === 0}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={graficos.veiculos} layout="vertical" margin={{ top: 8, right: 20, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} allowDecimals={false} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="#94a3b8"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => truncarRotulo(v, 18)}
                width={116}
              />
              <Tooltip content={<ChartTooltip formatter={(val) => `${val} corrida(s)`} />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Bar dataKey="quantidade" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardPage;
