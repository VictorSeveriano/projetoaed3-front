import React from 'react';
import { ABAS_CORRIDA } from './corridaPermissoes';

const CorridasFiltros = ({ abaAtiva, contadores, onSelecionarAba }) => (
  <nav className="corridas-tabs" aria-label="Filtrar corridas por status">
    {ABAS_CORRIDA.map((aba) => (
      <button
        key={aba.key}
        id={`tab-corridas-${aba.key.toLowerCase()}`}
        type="button"
        role="tab"
        aria-selected={abaAtiva === aba.key}
        className={`corridas-tab ${abaAtiva === aba.key ? 'corridas-tab--ativa' : ''}`}
        onClick={() => onSelecionarAba(aba.key)}
      >
        {aba.label}
        {contadores[aba.key] > 0 && (
          <span className="corridas-tab__count" aria-label={`${contadores[aba.key]} corridas`}>
            {contadores[aba.key]}
          </span>
        )}
      </button>
    ))}
  </nav>
);

export default CorridasFiltros;
