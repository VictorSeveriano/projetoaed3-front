import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import dashboardService from '../../services/dashboard.service';
import { formatarMoeda } from '../../utils/formatters';
import { Car, CheckCircle, Calendar, MapPin, DollarSign, Target } from 'lucide-react';
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
  const [stats, setStats] = useState({ totalCarros: 0, totalReservas: 0, reservasAtivas: 0, receitaTotal: 0 });
  const [graficos, setGraficos] = useState({ reservas: [], locais: [], carros: [], receitas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const [resumoRes, reservasRes, locaisRes, carrosRes, receitasRes] = await Promise.all([
          dashboardService.getResumo(),
          dashboardService.getReservas(),
          dashboardService.getLocais(),
          dashboardService.getCarros(),
          dashboardService.getReceitas()
        ]);
        
        setStats(resumoRes.data || {});
        setGraficos({
          reservas: reservasRes.data || [],
          locais: locaisRes.data || [],
          carros: carrosRes.data || [],
          receitas: receitasRes.data || []
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
        title="Dashboard"
        subtitle="Visão geral das reservas e utilização da frota"
      />

      <div className="stats-grid">
        <StatCard icon={<Car size={28} />} label="Total de Carros" value={stats.totalCarros} color="primary" loading={loading} />
        <StatCard icon={<Calendar size={28} />} label="Total Reservas" value={stats.totalReservas} color="accent" loading={loading} />
        <StatCard icon={<Target size={28} />} label="Reservas Ativas" value={stats.reservasAtivas} color="warning" loading={loading} />
        <StatCard icon={<DollarSign size={28} />} label="Receita Total" value={formatarMoeda(stats.receitaTotal || 0)} color="success" loading={loading} />
      </div>

      <div className="dashboard-grid">
        <ChartCard 
          title="Reservas por Mês" 
          loading={loading} 
          error={error} 
          empty={!graficos.reservas.some(d => d.quantidade > 0)}
          className="dashboard-grid__full"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graficos.reservas} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${val} reserva(s)`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="quantidade" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Locais mais Solicitados" 
          loading={loading} 
          error={error} 
          empty={graficos.locais.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={graficos.locais} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="nome" type="category" stroke="#94a3b8" tick={{ fill: '#f1f5f9', fontSize: 12 }} width={80} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${val} vez(es)`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="quantidade" fill="#06b6d4" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Carros mais Reservados" 
          loading={loading} 
          error={error} 
          empty={graficos.carros.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={graficos.carros} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="nome" type="category" stroke="#94a3b8" tick={{ fill: '#f1f5f9', fontSize: 12 }} width={100} />
              <Tooltip content={<CustomTooltip formatter={(val) => `${val} reserva(s)`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="quantidade" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Recebimentos Mensais" 
          loading={loading} 
          error={error} 
          empty={!graficos.receitas.some(d => d.valor > 0)}
          className="dashboard-grid__full"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graficos.receitas} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
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
      </div>
    </div>
  );
};

export default DashboardPage;
