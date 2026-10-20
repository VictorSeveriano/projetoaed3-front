import React, { useState, useEffect } from 'react';
import Badge from '../Badge';
import { formatarData } from '../../../utils/formatters';
import {
  ModalPerfilBase,
  CamposEnderecoPerfil,
  ENDERECO_VAZIO,
  isAddressDifferent,
} from './ModalPerfilBase';

const criarEstadoInicial = (motorista) => {
  const u = motorista?.usuario || {};
  return {
    cnh: motorista?.cnh || '',
    cpf: u.cpf || '',
    nome: u.nome || '',
    usuario: u.usuario || '',
    email: u.email || '',
    celular: u.celular || '',
    endereco: u.endereco || { ...ENDERECO_VAZIO },
  };
};

export const ModalPerfilMotorista = ({ isOpen, onClose, motorista, isAdmin = true, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => criarEstadoInicial(motorista));

  useEffect(() => {
    if (motorista) {
      setFormData(criarEstadoInicial(motorista));
    }
    setIsEditing(false);
  }, [motorista]);

  if (!motorista) return null;

  const u = motorista.usuario || {};
  const hasChanges =
    (motorista.cnh || '') !== formData.cnh ||
    (u.cpf || '') !== formData.cpf ||
    (u.nome || '') !== formData.nome ||
    (u.usuario || '') !== formData.usuario ||
    (u.email || '') !== formData.email ||
    (u.celular || '') !== formData.celular ||
    isAddressDifferent(u.endereco, formData.endereco);

  const handleSave = async () => {
    if (onSave) {
      await onSave(motorista.id, formData);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData(criarEstadoInicial(motorista));
    setIsEditing(false);
  };

  const editableFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Nome</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.nome || '—'}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Usuário</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.usuario} onChange={e => setFormData({ ...formData, usuario: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>@{u.usuario || '—'}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">E-mail</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="email" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.email || '—'}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Celular</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.celular || '—'}</span>
          )}
        </span>
      </div>
      {isAdmin && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">CPF</span>
          <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing ? (
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
            ) : (
              <span>{u.cpf || '—'}</span>
            )}
          </span>
        </div>
      )}
      <div className="perfil-campo">
        <span className="perfil-campo__label">CNH</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input
              type="text"
              className="input-field"
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              value={formData.cnh}
              onChange={e => setFormData({ ...formData, cnh: e.target.value })}
            />
          ) : (
            <span>{motorista.cnh || '—'}</span>
          )}
        </span>
      </div>
      {isAdmin && (
        <CamposEnderecoPerfil
          isEditing={isEditing}
          enderecoAtual={u.endereco}
          formEndereco={formData.endereco}
          onChangeEndereco={(endereco) => setFormData({ ...formData, endereco })}
        />
      )}
    </>
  );

  const readonlyFields = (
    <>
      {!isAdmin && (
        <>
          <div className="perfil-campo">
            <span className="perfil-campo__label">CPF</span>
            <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.cpf || '—'}</span>
          </div>
          <div className="perfil-campo">
            <span className="perfil-campo__label">Nome</span>
            <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.nome || '—'}</span>
          </div>
        </>
      )}
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cadastro</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{formatarData(motorista.criadoEm)}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Status</span>
        <div>
          <Badge label={motorista.statusCadastro} color={
            motorista.statusCadastro === 'APROVADO' ? 'success' :
              motorista.statusCadastro === 'PENDENTE' ? 'warning' : 'danger'
          } />
        </div>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Veículo</span>
        <span className="perfil-campo__valor">
          {motorista.veiculo ? (
            <button
              className="btn-link"
              onClick={motorista.onOpenVeiculo}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              {motorista.veiculo.marca} {motorista.veiculo.modelo} ({motorista.veiculo.placa})
            </button>
          ) : <span style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>Nenhum veículo associado</span>}
        </span>
      </div>
    </>
  );

  return (
    <ModalPerfilBase
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil do Motorista"
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
