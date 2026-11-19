import React, { useId } from 'react';

/**
 * CampoPerfil — Campo de exibição/edição reutilizável para formulários de perfil.
 *
 * No modo leitura, exibe `valor` como texto simples.
 * No modo edição, renderiza um <input> associado via htmlFor/id com as props fornecidas via `inputProps`.
 *
 * Props:
 * @param {string}       label         - Rótulo do campo (obrigatório)
 * @param {*}            valor         - Valor exibido no modo leitura (string | ReactNode)
 * @param {boolean}      isEditing     - Se true, exibe o input; se false, exibe o valor
 * @param {object}       inputProps    - Props do <input> no modo edição (type, value, onChange, etc.)
 * @param {string}       readonlyColor - Cor CSS aplicada ao texto no modo leitura durante edição
 * @param {boolean}      somenteLeitura - Se true, nunca exibe o input (campo sempre read-only)
 */
const CampoPerfil = ({
  label,
  valor,
  isEditing = false,
  inputProps = {},
  readonlyColor,
  somenteLeitura = false,
}) => {
  const autoId = useId();
  const inputId = inputProps.id || `perfil-campo-${autoId.replace(/:/g, '')}`;
  const mostrarInput = isEditing && !somenteLeitura;

  return (
    <div className="perfil-campo">
      {mostrarInput ? (
        <label className="perfil-campo__label" htmlFor={inputId}>
          {label}
        </label>
      ) : (
        <span className="perfil-campo__label">{label}</span>
      )}
      <div className="perfil-campo__valor">
        {mostrarInput ? (
          <input
            id={inputId}
            className="input-field input-field--compact"
            {...inputProps}
          />
        ) : (
          <span style={readonlyColor ? { color: readonlyColor } : undefined}>
            {valor ?? '—'}
          </span>
        )}
      </div>
    </div>
  );
};

export default CampoPerfil;
