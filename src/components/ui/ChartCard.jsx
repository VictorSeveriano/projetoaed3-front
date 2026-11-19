import React from 'react';
import Card from './Card';
import Loading from './Loading';
import { AlertCircle, BarChart3 } from 'lucide-react';

/**
 * Tooltip compartilhado para gráficos Recharts (DashboardPage e RelatorioMotoristaPage).
 */
export const ChartTooltip = ({ active, payload, label, formatter }) => {
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
 * ChartCard encapsula o comportamento de exibir gráficos com estados visuais consistentes.
 */
const ChartCard = ({ title, subtitle, loading, error, empty, children, className = '' }) => {
  return (
    <Card className={`chart-card ${className}`.trim()}>
      <Card.Header>
        <div>
          <h2 className="card-section-title">{title}</h2>
          {subtitle && <p className="card-section-subtitle">{subtitle}</p>}
        </div>
      </Card.Header>
      <Card.Body className="chart-card__body">
        {loading ? (
          <div className="chart-card__state">
            <Loading message="Carregando dados..." />
          </div>
        ) : error ? (
          <div className="chart-card__state chart-card__error" role="alert">
            <AlertCircle size={28} aria-hidden="true" />
            <p>Não foi possível carregar os dados deste gráfico.</p>
          </div>
        ) : empty ? (
          <div className="chart-card__state chart-card__empty" role="status">
            <BarChart3 size={28} aria-hidden="true" />
            <p>Sem dados disponíveis para exibição.</p>
          </div>
        ) : (
          <div className="chart-container">
            {children}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChartCard;
