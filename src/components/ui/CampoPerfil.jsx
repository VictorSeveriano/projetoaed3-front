import React from 'react';

/**
 * CampoPerfil — Campo de exibição/edição reutilizável para formulários de perfil.
 *
 * No modo leitura, exibe `valor` como texto simples.
 * No modo edição, renderiza um <input> com as props fornecidas via `inputProps`.
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
  const mostrarInput = isEditing && !somenteLeitura;

  return (
    <div className="perfil-campo">
      <span className="perfil-campo__label">{label}</span>
      <span
        className="perfil-campo__valor"
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        {mostrarInput ? (
          <input
            className="input-field"
            style={{ padding: '4px', height: 'auto', width: '100%' }}
            {...inputProps}
          />
        ) : (
          <span style={readonlyColor ? { color: readonlyColor } : undefined}>
            {valor ?? '—'}
          </span>
        )}
      </span>
    </div>
  );
};

export default CampoPerfil;

