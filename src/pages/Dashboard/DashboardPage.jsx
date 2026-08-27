import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import carrosService from '../../services/carros.service';
import reservasService from '../../services/reservas.service';
import localizacoesService from '../../services/localizacoes.service';

const StatCard = ({ icon, label, value, color = 'primary', loading }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__content">
      <span className="stat-card__value">{loading ? '...' : value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState({ carros: 0, disponiveis: 0, reservasAtivas: 0, localizacoes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [carrosRes, disponiveisRes, reservasRes, locRes] = await Promise.all([
          carrosService.listarTodos(),
          carrosService.listarDisponiveis(),
          reservasService.listarTodas(),
          localizacoesService.listarTodas(),
        ]);
        setStats({
          carros:         carrosRes.data?.length ?? 0,
          disponiveis:    disponiveisRes.data?.length ?? 0,
          reservasAtivas: (reservasRes.data ?? []).filter((r) => r.status === 'ATIVA').length,
          localizacoes:   locRes.data?.length ?? 0,
        });
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
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
        subtitle="Visao geral do sistema de reservas"
      />

      <div className="stats-grid">
        <StatCard icon="🚗" label="Total de Carros"     value={stats.carros}         color="primary" loading={loading} />
        <StatCard icon="✅" label="Carros Disponíveis"  value={stats.disponiveis}     color="success" loading={loading} />
        <StatCard icon="📋" label="Reservas Ativas"     value={stats.reservasAtivas}  color="warning" loading={loading} />
        <StatCard icon="📍" label="Localizações"        value={stats.localizacoes}    color="accent"  loading={loading} />
      </div>

      <div className="dashboard-info">
        <Card className="dashboard-info__card">
          <Card.Header>
            <h2 className="card-section-title">🗺️ Grafo de Localidades</h2>
          </Card.Header>
          <Card.Body>
            <p className="dashboard-info__text">
              O sistema utiliza um <strong>Grafo com Lista de Adjacência</strong> para representar
              as conexões entre localidades. O <strong>Algoritmo de Dijkstra</strong> é aplicado
              para calcular a rota mais curta entre pontos de retirada e devolução durante o
              processo de reserva.
            </p>
            <div className="graph-preview">
              {[
                { from: 'Centro', to: 'Shopping',    km: 5  },
                { from: 'Centro', to: 'Rodoviária',  km: 7  },
                { from: 'Shopping', to: 'Aeroporto', km: 12 },
                { from: 'Rodoviária', to: 'Praia',   km: 10 },
                { from: 'Praia', to: 'Universidade', km: 8  },
              ].map((edge, i) => (
                <div key={i} className="graph-edge">
                  <span className="graph-edge__node">{edge.from}</span>
                  <span className="graph-edge__weight">──{edge.km}km──▶</span>
                  <span className="graph-edge__node">{edge.to}</span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card className="dashboard-info__card">
          <Card.Header>
            <h2 className="card-section-title">⚡ Tecnologias</h2>
          </Card.Header>
          <Card.Body>
            <ul className="tech-list">
              <li className="tech-item"><span className="tech-item__icon">⚛️</span> React + Vite (Frontend)</li>
              <li className="tech-item"><span className="tech-item__icon">🟢</span> Node.js + Express (Backend)</li>
              <li className="tech-item"><span className="tech-item__icon">📐</span> Grafo com Lista de Adjacência</li>
              <li className="tech-item"><span className="tech-item__icon">🧭</span> Algoritmo de Dijkstra</li>
              <li className="tech-item"><span className="tech-item__icon">🏗️</span> Controller → Service → Repository</li>
            </ul>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
