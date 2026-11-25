import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import BotoesExportacao from '../../components/ui/BotoesExportacao';
import ChartCard, { ChartTooltip } from '../../components/ui/ChartCard';
import dashboardService from '../../services/dashboard.service';
import { formatarMoeda } from '../../utils/formatters';
import { Car, Calendar, DollarSign, Target, Filter, RotateCcw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';

const truncarRotulo = (texto, max = 18) => {
  if (!texto) return '';
  const str = String(texto);
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
};

const MARGIN_AREA = { top: 16, right: 16, left: 4, bottom: 4 };
const MARGIN_BAR_VERTICAL = { top: 16, right: 16, left: 0, bottom: 4 };
const MARGIN_BAR_HORIZONTAL = { top: 8, right: 20, left: 4, bottom: 4 };
const TICK_EIXO = { fill: '#94a3b8', fontSize: 12 };
const TICK_CATEGORIA = { fill: '#cbd5e1', fontSize: 11 };
const CURSOR_BAR = { fill: 'rgba(148,163,184,0.08)' };

const formatarEixoReais = (value) => `R$ ${value}`;
const formatarTooltipMoeda = (val) => formatarMoeda(val);
const formatarTooltipCorridas = (val) => `${val} corrida(s)`;
const formatarTooltipSolicitacoes = (val) => `${val} solicitações`;
const truncarRotulo20 = (v) => truncarRotulo(v, 20);
const truncarRotulo18 = (v) => truncarRotulo(v, 18);

const STATS_INICIAL = { totalCorridas: 0, corridasAtivas: 0, veiculosDisponiveis: 0, faturamentoTotal: 0 };
const GRAFICOS_INICIAL = { corridas: [], origens: [], rotas: [], veiculos: [], faturamento: [] };
const FILTROS_INICIAIS = { dataInicio: '', dataFim: '', status: '', classe: '' };

const DashboardPage = () => {
  const [stats, setStats] = useState(STATS_INICIAL);
  const [graficos, setGraficos] = useState(GRAFICOS_INICIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mensagemErroFiltro, setMensagemErroFiltro] = useState('');

  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [exportandoFormato, setExportandoFormato] = useState('');
  const [erroExportacao, setErroExportacao] = useState('');

  const possuiFiltroAtivo = Boolean(
    filtros.dataInicio || filtros.dataFim || filtros.status || filtros.classe
  );

  const carregarDashboard = useCallback(async (filtrosAtuais) => {
    try {
      setLoading(true);
      setError(false);
      setMensagemErroFiltro('');
      const res = await dashboardService.getCompleto(filtrosAtuais);
      const dados = res?.data || {};
      setStats(dados.resumo || STATS_INICIAL);
      setGraficos({
        corridas: dados.corridas || [],
        origens: dados.origens || [],
        rotas: dados.rotas || [],
        veiculos: dados.veiculos || [],
        faturamento: dados.faturamento || [],
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      const msg = err?.response?.data?.message || '';
      if (msg) {
        setMensagemErroFiltro(msg);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filtros.dataInicio && filtros.dataFim && filtros.dataInicio > filtros.dataFim) {
      setMensagemErroFiltro('A data inicial não pode ser posterior à data final.');
      return;
    }
    carregarDashboard(filtros);
  }, [filtros, carregarDashboard]);

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setErroExportacao('');
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setErroExportacao('');
    setMensagemErroFiltro('');
    setFiltros(FILTROS_INICIAIS);
  };

  const handleExportar = async (formato) => {
    if (filtros.dataInicio && filtros.dataFim && filtros.dataInicio > filtros.dataFim) {
      setErroExportacao('Corrija o intervalo de datas antes de exportar o relatório.');
      return;
    }
    setErroExportacao('');
    setExportandoFormato(formato);
    try {
      await dashboardService.exportarRelatorio(formato, filtros);
    } catch (err) {
      setErroExportacao(err?.message || 'Não foi possível exportar o relatório do dashboard.');
    } finally {
      setExportandoFormato('');
    }
  };

  const temFaturamento = useMemo(() => graficos.faturamento.some((d) => d.valor > 0), [graficos.faturamento]);
  const temCorridas = useMemo(() => graficos.corridas.some((d) => d.quantidade > 0), [graficos.corridas]);

  return (
    <div className="page animate-fade-in">
      <Header
        title="Dashboard de Corridas"
        subtitle="Visão geral das corridas solicitadas, faturamento e operação"
        actions={
          <BotoesExportacao
            idPrefix="btn-exportar-dashboard"
            exportandoFormato={exportandoFormato}
            onExportar={handleExportar}
          />
        }
      />

      {/* Barra de filtros sincronizada com indicadores, gráficos e exportação */}
      <div className="filters-bar" role="search" aria-label="Filtrar métricas do dashboard">
        <div className="tools-bar__field--date">
          <input
            type="date"
            name="dataInicio"
            aria-label="Data inicial do dashboard"
            title="Data inicial"
            value={filtros.dataInicio}
            onChange={handleChangeFiltro}
            className="input-field"
          />
        </div>

        <div className="tools-bar__field--date">
          <input
            type="date"
            name="dataFim"
            aria-label="Data final do dashboard"
            title="Data final"
            value={filtros.dataFim}
            onChange={handleChangeFiltro}
            className="input-field"
          />
        </div>

        <div className="tools-bar__field">
          <div className="input-with-icon">
            <span className="input-with-icon__icon" aria-hidden="true"><Filter size={16} /></span>
            <select
              name="status"
              aria-label="Filtrar dashboard por status"
              value={filtros.status}
              onChange={handleChangeFiltro}
              className="input-field input-field--select"
            >
              <option value="">Todos os status</option>
              <option value="SOLICITADA">Solicitada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="tools-bar__field">
          <select
            name="classe"
            aria-label="Filtrar dashboard por classe"
            value={filtros.classe}
            onChange={handleChangeFiltro}
            className="input-field input-field--select"
          >
            <option value="">Todas as classes</option>
            <option value="BASICO">Básico</option>
            <option value="NORMAL">Normal</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>

        {possuiFiltroAtivo && (
          <Button type="button" variant="ghost" size="sm" onClick={limparFiltros}>
            <RotateCcw size={14} aria-hidden="true" />
            Limpar
          </Button>
        )}
      </div>

      {(mensagemErroFiltro || erroExportacao) && (
        <div className="form-error" role="alert">
          <span>{mensagemErroFiltro || erroExportacao}</span>
        </div>
      )}

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
          empty={!temFaturamento}
          className="dashboard-grid__full"
        >
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={graficos.faturamento} margin={MARGIN_AREA}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={TICK_EIXO} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                tick={TICK_EIXO}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatarEixoReais}
                width={74}
              />
              <Tooltip content={<ChartTooltip formatter={formatarTooltipMoeda} />} />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorValor)"
                strokeWidth={2.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Corridas por Mês"
          subtitle="Volume mensal de reservas registradas"
          loading={loading}
          error={error}
          empty={!temCorridas}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={graficos.corridas} margin={MARGIN_BAR_VERTICAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis dataKey="mes" stroke="#94a3b8" tick={TICK_EIXO} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={TICK_EIXO} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
              <Tooltip content={<ChartTooltip formatter={formatarTooltipCorridas} />} cursor={CURSOR_BAR} />
              <Bar dataKey="quantidade" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false} />
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
            <BarChart data={graficos.rotas} layout="vertical" margin={MARGIN_BAR_HORIZONTAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={TICK_EIXO} tickLine={false} allowDecimals={false} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="#94a3b8"
                tick={TICK_CATEGORIA}
                tickLine={false}
                axisLine={false}
                tickFormatter={truncarRotulo20}
                width={126}
              />
              <Tooltip content={<ChartTooltip formatter={formatarTooltipCorridas} />} cursor={CURSOR_BAR} />
              <Bar dataKey="quantidade" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false} />
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
            <BarChart data={graficos.origens} layout="vertical" margin={MARGIN_BAR_HORIZONTAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={TICK_EIXO} tickLine={false} allowDecimals={false} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="#94a3b8"
                tick={TICK_CATEGORIA}
                tickLine={false}
                axisLine={false}
                tickFormatter={truncarRotulo18}
                width={116}
              />
              <Tooltip content={<ChartTooltip formatter={formatarTooltipSolicitacoes} />} cursor={CURSOR_BAR} />
              <Bar dataKey="quantidade" fill="#38bdf8" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false} />
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
            <BarChart data={graficos.veiculos} layout="vertical" margin={MARGIN_BAR_HORIZONTAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={TICK_EIXO} tickLine={false} allowDecimals={false} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="#94a3b8"
                tick={TICK_CATEGORIA}
                tickLine={false}
                axisLine={false}
                tickFormatter={truncarRotulo18}
                width={116}
              />
              <Tooltip content={<ChartTooltip formatter={formatarTooltipCorridas} />} cursor={CURSOR_BAR} />
              <Bar dataKey="quantidade" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardPage;
