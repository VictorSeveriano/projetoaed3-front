import React from 'react';
import { MapPin, Search, Check, Loader, X } from 'lucide-react';

export const LocalizacaoInput = ({ 
  campo, id, label, placeholder, listRef, extraAcoes, handleKeyDown, setError 
}) => {
  const listId = id + '-sugestoes';
  const origemOuDestino = label.toLowerCase();
  
  return (
    <section className="rotas-section" aria-label={label}>
      <h2 className="rotas-section__title">
        <MapPin size={16} aria-hidden="true" />
        {label}
      </h2>
      <div className="autocomplete-wrapper" ref={listRef}>
        <div className="rotas-origem-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              id={id}
              className="input-field"
              placeholder={placeholder}
              value={campo.texto}
              autoComplete="off"
              aria-label={label}
              aria-autocomplete="list"
              aria-expanded={campo.mostrarSugestoes && campo.sugestoes.length > 0}
              aria-controls={listId}
              aria-activedescendant={
                campo.activeIndex >= 0 ? `${listId}-item-${campo.activeIndex}` : undefined
              }
              onChange={(e) => { setError(''); campo.setTexto(e.target.value); }}
              onFocus={() => { if (campo.sugestoes.length > 0) campo.setMostrarSugestoes(true); }}
              onKeyDown={(e) => handleKeyDown(e, campo, listId)}
            />
            {/* Icone de status no campo */}
            <span className="autocomplete-field-icon" aria-hidden="true">
              {campo.buscando
                ? <Loader size={14} className="spin-icon" />
                : campo.selecionada
                  ? <Check size={14} style={{ color: 'var(--color-success)' }} />
                  : campo.texto.length >= 3
                    ? <Search size={14} />
                    : null
              }
            </span>
          </div>
          {/* Botao limpar campo */}
          {campo.texto && (
            <button
              type="button"
              className="autocomplete-clear-btn"
              aria-label={'Limpar ' + origemOuDestino}
              onClick={() => { campo.limpar(); setError(''); }}
            >
              <X size={14} />
            </button>
          )}
          {extraAcoes}
        </div>

        {/* Dropdown de sugestoes */}
        {campo.mostrarSugestoes && campo.sugestoes.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            aria-label={'Sugestoes de ' + origemOuDestino}
            className="autocomplete-list"
          >
            {campo.sugestoes.map((s, i) => (
              <li
                key={i}
                id={`${listId}-item-${i}`}
                role="option"
                aria-selected={campo.activeIndex === i}
                className={'autocomplete-item' + (campo.activeIndex === i ? ' autocomplete-item--active' : '')}
                onMouseDown={(e) => {
                  // mouseDown em vez de click para evitar fechar antes do clique ser processado
                  e.preventDefault();
                  campo.selecionar(s);
                  setError('');
                }}
                onMouseEnter={() => campo.setActiveIndex(i)}
              >
                <MapPin size={12} className="autocomplete-item__icon" aria-hidden="true" />
                <span className="autocomplete-item__texto">{s.descricao}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Estados de feedback sem sugestoes */}
        {campo.mostrarSugestoes && !campo.buscando && campo.sugestoes.length === 0 && campo.texto.length >= 3 && !campo.selecionada && (
          <p className="autocomplete-status autocomplete-status--empty" role="status">
            Nenhum local encontrado para esta busca.
          </p>
        )}
        {campo.erro && (
          <p className="autocomplete-status autocomplete-status--error" role="alert">
            {campo.erro}
          </p>
        )}

        {/* Badge de confirmacao */}
        {campo.selecionada && (
          <p className="rotas-geo-info" aria-live="polite">
            <Check size={14} aria-hidden="true" />
            Localizacao confirmada
          </p>
        )}
      </div>
    </section>
  );
};
