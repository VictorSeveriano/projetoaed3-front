import React from 'react';
import Card from './Card';
import Loading from './Loading';

/**
 * ChartCard encapsula o comportamento de exibir graficos com estados visuais consistentes.
 */
const ChartCard = ({ title, loading, error, empty, children, className = '' }) => {
  return (
    <Card className={`chart-card ${className}`}>
      <Card.Header>
        <h2 className="card-section-title">{title}</h2>
      </Card.Header>
      <Card.Body className="chart-card__body">
        {loading ? (
          <div className="chart-card__state">
            <Loading text="Carregando dados..." />
          </div>
        ) : error ? (
          <div className="chart-card__state chart-card__error">
            <p>Ocorreu um erro ao carregar os dados.</p>
          </div>
        ) : empty ? (
          <div className="chart-card__state chart-card__empty">
            <p>Não há dados suficientes para exibir este gráfico.</p>
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
