import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import dashboardService from '../../services/dashboard.service';
import { formatarMoeda } from '../../utils/formatters';
import { Car, CheckCircle, Calendar, MapPin, DollarSign, Target, Route } from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

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
          dashboardService.getFaturamento()
        ]);
        
        setStats(resumoRes.data || {});
        setGraficos({
          corridas: corridasRes.data || [],
          origens: origensRes.data || [],
          destinos: destinosRes.data || [],
          rotas: rotasRes.data || [],
          veiculos: veiculosRes.data || [],
          faturamento: faturamentoRes.data || []
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
        subtitle="Visao geral das corridas solicitadas, faturamento e operacao"
      />

      <div className="stats-grid">
        <StatCard icon={<Calendar size={28} />} label="Total Corridas" value={stats.totalCorridas} color="primary" loading={loading} />
        <StatCard icon={<Target size={28} />} label="Corridas Ativas" value={stats.corridasAtivas} color="warning" loading={loading} />
        <StatCard icon={<Car size={28} />} label="Veiculos Disponiveis" value={stats.veiculosDisponiveis} color="accent" loading={loading} />
        <StatCard icon={<DollarSign size={28} />} label="Faturamento Total" value={formatarMoeda(stats.faturamentoTotal || 0)} color="success" loading={loading} />
      </div>

      <div className="dashboard-grid">
        <ChartCard 
          title="Faturamento Mensal" 
          loading={loading} 
          error={error} 
          empty={!graficos.faturamento.some(d => d.valor > 0)}
          className="dashboard-grid__full"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graficos.faturamento} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                tickFormatter={(value) => `R$ ${value}`} 
                width={80}
              />
              <Tooltip content={<CustomTooltip formatter={(val) => formatarMoeda(val)} />} />
              <Area type="monotone" dataKey="valor" stroke="#10b981" fillOpacity={1} fill="url(#colorValor)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Corridas por Mes" 
          loading={loading} 
          error={error} 
          empty={!graficos.corridas.some(d => d.quantidade > 0)}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={graficos.corridas} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${val} corrida(s)`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="quantidade" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Rotas mais Utilizadas" 
          loading={loading} 
          error={error} 
          empty={graficos.rotas.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={graficos.rotas} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="nome" type="category" stroke="#94a3b8" tick={{ fill: '#f1f5f9', fontSize: 10 }} width={120} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${val} corrida(s)`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="quantidade" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Origens mais Solicitadas" 
          loading={loading} 
          error={error} 
          empty={graficos.origens.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={graficos.origens} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="nome" type="category" stroke="#94a3b8" tick={{ fill: '#f1f5f9', fontSize: 12 }} width={100} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${val} solicitacoes`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="quantidade" fill="#0ea5e9" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Veiculos mais Alocados" 
          loading={loading} 
          error={error} 
          empty={graficos.veiculos.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={graficos.veiculos} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="nome" type="category" stroke="#94a3b8" tick={{ fill: '#f1f5f9', fontSize: 12 }} width={100} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${val} corrida(s)`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="quantidade" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardPage;
