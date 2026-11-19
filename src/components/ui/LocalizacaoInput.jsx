import React from 'react';
import { MapPin, Search, Check, Loader, X } from 'lucide-react';

export const LocalizacaoInput = ({
  campo,
  id,
  label,
  stepNumber,
  placeholder,
  listRef,
  extraAcoes,
  handleKeyDown,
  setError,
  carregandoExterno = false,
}) => {
  const listId = `${id}-sugestoes`;
  const origemOuDestino = label.toLowerCase();
  const estaBuscando = campo.buscando || carregandoExterno;

  return (
    <section className="rotas-section" aria-label={label}>
      <h2 className="rotas-section__title">
        {stepNumber ? (
          <span className="rotas-step-num" aria-hidden="true">{stepNumber}</span>
        ) : (
          <MapPin size={15} aria-hidden="true" />
        )}
        <label htmlFor={id}>{label}</label>
      </h2>
      <div className="autocomplete-wrapper" ref={listRef}>
        <div className="rotas-origem-row">
          <div className="rotas-input-wrap">
            <input
              id={id}
              className="input-field"
              placeholder={placeholder}
              value={campo.texto}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={campo.mostrarSugestoes && campo.sugestoes.length > 0}
              aria-controls={listId}
              aria-activedescendant={
                campo.activeIndex >= 0 ? `${listId}-item-${campo.activeIndex}` : undefined
              }
              onChange={(e) => { setError(''); campo.setTexto(e.target.value); }}
              onFocus={() => { if (campo.sugestoes.length > 0) campo.setMostrarSugestoes(true); }}
              onKeyDown={(e) => handleKeyDown(e, campo)}
            />
            <span
              className={`autocomplete-field-icon ${!estaBuscando && campo.selecionada ? 'autocomplete-field-icon--confirmed' : ''}`.trim()}
              aria-hidden="true"
            >
              {estaBuscando
                ? <Loader size={14} className="spin-icon" />
                : campo.selecionada
                  ? <Check size={14} />
                  : campo.texto.length >= 3
                    ? <Search size={14} />
                    : null}
            </span>
          </div>
          {campo.texto && (
            <button
              type="button"
              className="autocomplete-clear-btn"
              aria-label={`Limpar ${origemOuDestino}`}
              title={`Limpar ${origemOuDestino}`}
              onClick={() => { campo.limpar(); setError(''); }}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
          {extraAcoes}
        </div>

        {/* Dropdown de sugestões */}
        {campo.mostrarSugestoes && campo.sugestoes.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            aria-label={`Sugestões de ${origemOuDestino}`}
            className="autocomplete-list"
          >
            {campo.sugestoes.map((s, i) => (
              <li
                key={i}
                id={`${listId}-item-${i}`}
                role="option"
                aria-selected={campo.activeIndex === i}
                className={`autocomplete-item ${campo.activeIndex === i ? 'autocomplete-item--active' : ''}`.trim()}
                onMouseDown={(e) => {
                  e.preventDefault();
                  campo.selecionar(s);
                  setError('');
                }}
                onMouseEnter={() => campo.setActiveIndex(i)}
              >
                <MapPin size={13} className="autocomplete-item__icon" aria-hidden="true" />
                <span className="autocomplete-item__texto">{s.descricao}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Estados de feedback sem sugestões */}
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

        {/* Badge de confirmação */}
        {carregandoExterno && (
          <p className="autocomplete-status" role="status" aria-live="polite">
            Obtendo endereço da sua localização atual...
          </p>
        )}
        {!carregandoExterno && campo.selecionada && (
          <p className="rotas-geo-info" aria-live="polite">
            <Check size={14} aria-hidden="true" />
            Localização confirmada
          </p>
        )}
      </div>
    </section>
  );
};
