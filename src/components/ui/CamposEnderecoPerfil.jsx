import React from 'react';
import { ENDERECO_VAZIO } from '../../utils/endereco';

export const CamposEnderecoPerfil = ({ isEditing, enderecoAtual, formEndereco, onChangeEndereco }) => {
  const atualizarCampo = (campo, valor) => {
    onChangeEndereco({ ...(formEndereco || ENDERECO_VAZIO), [campo]: valor });
  };

  return (
    <div className="perfil-campo">
      <span className="perfil-campo__label">Endereço</span>
      <span className="perfil-campo__valor" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isEditing ? (
          <>
            <input
              type="text"
              className="input-field"
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              placeholder="Rua"
              value={formEndereco?.rua || ''}
              onChange={(e) => atualizarCampo('rua', e.target.value)}
            />
            <input
              type="text"
              className="input-field"
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              placeholder="Bairro"
              value={formEndereco?.bairro || ''}
              onChange={(e) => atualizarCampo('bairro', e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-field"
                style={{ padding: '4px', height: 'auto', width: '100%' }}
                placeholder="Número"
                value={formEndereco?.numero || ''}
                onChange={(e) => atualizarCampo('numero', e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                style={{ padding: '4px', height: 'auto', width: '100%' }}
                placeholder="CEP"
                value={formEndereco?.cep || ''}
                onChange={(e) => atualizarCampo('cep', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-field"
                style={{ padding: '4px', height: 'auto', width: '100%' }}
                placeholder="Cidade"
                value={formEndereco?.cidade || ''}
                onChange={(e) => atualizarCampo('cidade', e.target.value)}
              />
              <input
                type="text"
                className="input-field"
                style={{ padding: '4px', height: 'auto', width: '100%' }}
                placeholder="UF"
                value={formEndereco?.estado || ''}
                onChange={(e) => atualizarCampo('estado', e.target.value)}
              />
            </div>
          </>
        ) : (
          <span>
            {enderecoAtual ? (
              <>
                {enderecoAtual.rua}, {enderecoAtual.numero} - {enderecoAtual.bairro}
                <br />
                {enderecoAtual.cidade}/{enderecoAtual.estado} - CEP: {enderecoAtual.cep}
              </>
            ) : (
              '—'
            )}
          </span>
        )}
      </span>
    </div>
  );
};
