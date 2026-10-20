import React, { useState, useEffect } from 'react';
import Badge from '../Badge';
import { formatarData } from '../../../utils/formatters';
import {
  ModalPerfilBase,
  CamposEnderecoPerfil,
  ENDERECO_VAZIO,
  isAddressDifferent,
} from './ModalPerfilBase';

const criarEstadoInicial = (usuario) => ({
  nome: usuario?.nome || '',
  usuario: usuario?.usuario || '',
  cpf: usuario?.cpf || '',
  email: usuario?.email || '',
  celular: usuario?.celular || '',
  endereco: usuario?.endereco || { ...ENDERECO_VAZIO },
});

export const ModalPerfilUsuario = ({ isOpen, onClose, usuario, isAdmin = true, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => criarEstadoInicial(usuario));

  useEffect(() => {
    if (usuario) {
      setFormData(criarEstadoInicial(usuario));
    }
    setIsEditing(false);
  }, [usuario]);

  if (!usuario) return null;

  const hasChanges =
    (usuario.nome || '') !== formData.nome ||
    (usuario.usuario || '') !== formData.usuario ||
    (usuario.cpf || '') !== formData.cpf ||
    (usuario.email || '') !== formData.email ||
    (usuario.celular || '') !== formData.celular ||
    isAddressDifferent(usuario.endereco, formData.endereco);

  const handleSave = async () => {
    if (onSave) {
      await onSave(usuario.id, formData);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData(criarEstadoInicial(usuario));
    setIsEditing(false);
  };

  const editableFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Nome Completo</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input
              type="text"
              className="input-field"
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
            />
          ) : (
            <span>{usuario.nome}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Usuário</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input
              type="text"
              className="input-field"
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              value={formData.usuario}
              onChange={e => setFormData({ ...formData, usuario: e.target.value })}
            />
          ) : (
            <span>@{usuario.usuario}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">E-mail</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="email" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          ) : <span>{usuario.email || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Celular</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} />
          ) : <span>{usuario.celular || '—'}</span>}
        </span>
      </div>
      <CamposEnderecoPerfil
        isEditing={isEditing}
        enderecoAtual={usuario.endereco}
        formEndereco={formData.endereco}
        onChangeEndereco={(endereco) => setFormData({ ...formData, endereco })}
      />
      {isAdmin && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">CPF</span>
          <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing ? (
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
            ) : <span>{usuario.cpf || '—'}</span>}
          </span>
        </div>
      )}
    </>
  );

  const readonlyFields = (
    <>
      {!isAdmin && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">CPF</span>
          <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{usuario.cpf || '—'}</span>
        </div>
      )}
      <div className="perfil-campo">
        <span className="perfil-campo__label">Perfil</span>
        <span className="perfil-campo__valor">
          <Badge label={usuario.perfil} color={usuario.perfil === 'ADMINISTRADOR' ? 'danger' : usuario.perfil === 'MOTORISTA' ? 'warning' : 'info'} />
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cadastro</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{formatarData(usuario.criadoEm)}</span>
      </div>
      {usuario.perfil === 'MOTORISTA' && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">Motorista Vinculado</span>
          <span className="perfil-campo__valor">
            <button
              className="btn-link"
              onClick={usuario.onOpenMotorista}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Ver Perfil de Motorista
            </button>
          </span>
        </div>
      )}
    </>
  );

  return (
    <ModalPerfilBase
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil do Usuário"
      canEdit
      isEditing={isEditing}
      onStartEdit={() => setIsEditing(true)}
      onCancelEdit={handleCancelEdit}
      onSave={handleSave}
      hasChanges={hasChanges}
      editableFields={editableFields}
      readonlyFields={readonlyFields}
    />
  );
};
