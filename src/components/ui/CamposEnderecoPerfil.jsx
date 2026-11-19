import React from 'react';
import { ENDERECO_VAZIO } from '../../utils/endereco';

export const CamposEnderecoPerfil = ({ isEditing, enderecoAtual, formEndereco, onChangeEndereco }) => {
  const atualizarCampo = (campo, valor) => {
    onChangeEndereco({ ...(formEndereco || ENDERECO_VAZIO), [campo]: valor });
  };

  return (
    <div className="perfil-campo perfil-campo--full">
      <span className="perfil-campo__label">Endereço</span>
      <div className="perfil-campo__valor">
        {isEditing ? (
          <>
            <div className="perfil-inline-row">
              <input
                type="text"
                className="input-field input-field--compact"
                aria-label="Rua"
                placeholder="Rua"
                value={formEndereco?.rua || ''}
                onChange={(e) => atualizarCampo('rua', e.target.value)}
              />
              <input
                type="text"
                className="input-field input-field--compact"
                aria-label="Bairro"
                placeholder="Bairro"
                value={formEndereco?.bairro || ''}
                onChange={(e) => atualizarCampo('bairro', e.target.value)}
              />
            </div>
            <div className="perfil-inline-row">
              <input
                type="text"
                className="input-field input-field--compact"
                aria-label="Número"
                placeholder="Número"
                value={formEndereco?.numero || ''}
                onChange={(e) => atualizarCampo('numero', e.target.value)}
              />
              <input
                type="text"
                className="input-field input-field--compact"
                aria-label="CEP"
                placeholder="CEP"
                value={formEndereco?.cep || ''}
                onChange={(e) => atualizarCampo('cep', e.target.value)}
              />
              <input
                type="text"
                className="input-field input-field--compact"
                aria-label="Cidade"
                placeholder="Cidade"
                value={formEndereco?.cidade || ''}
                onChange={(e) => atualizarCampo('cidade', e.target.value)}
              />
              <input
                type="text"
                className="input-field input-field--compact"
                aria-label="Estado (UF)"
                placeholder="UF"
                maxLength={2}
                value={formEndereco?.estado || ''}
                onChange={(e) => atualizarCampo('estado', e.target.value)}
              />
            </div>
          </>
        ) : (
          <span>
            {enderecoAtual ? (
              <>
                {enderecoAtual.rua}, {enderecoAtual.numero} — {enderecoAtual.bairro}
                <br />
                <span className="text-muted">
                  {enderecoAtual.cidade}/{enderecoAtual.estado} • CEP: {enderecoAtual.cep}
                </span>
              </>
            ) : (
              '—'
            )}
          </span>
        )}
      </div>
    </div>
  );
};
