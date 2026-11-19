import React, { useCallback } from 'react';
import Badge from '../Badge';
import { formatarData } from '../../../utils/formatters';
import { ModalPerfilBase } from './ModalPerfilBase';
import { CamposEnderecoPerfil } from '../CamposEnderecoPerfil';
import { ENDERECO_VAZIO, isAddressDifferent } from '../../../utils/endereco';
import { useModalEdicao } from '../../../hooks/useModalEdicao';
import CampoPerfil from '../CampoPerfil';

const criarEstadoInicial = (usuario) => ({
  nome: usuario?.nome || '',
  usuario: usuario?.usuario || '',
  cpf: usuario?.cpf || '',
  email: usuario?.email || '',
  celular: usuario?.celular || '',
  endereco: usuario?.endereco || { ...ENDERECO_VAZIO },
});

export const ModalPerfilUsuario = ({ isOpen, onClose, usuario, isAdmin = true, onSave }) => {
  const estadoInicial = useCallback((item) => criarEstadoInicial(item), []);
  const {
    isEditing,
    formData,
    setFormData,
    iniciarEdicao,
    cancelarEdicao,
    salvarEdicao,
  } = useModalEdicao({
    item: usuario,
    criarEstadoInicial: estadoInicial,
    onSave,
  });

  if (!usuario) return null;

  const corSomenteLeitura = isEditing ? 'var(--text-muted)' : undefined;
  const hasChanges =
    (usuario.nome || '') !== formData.nome ||
    (usuario.usuario || '') !== formData.usuario ||
    (usuario.cpf || '') !== formData.cpf ||
    (usuario.email || '') !== formData.email ||
    (usuario.celular || '') !== formData.celular ||
    isAddressDifferent(usuario.endereco, formData.endereco);

  const editableFields = (
    <>
      <CampoPerfil
        label="Nome Completo"
        valor={usuario.nome}
        isEditing={isEditing}
        inputProps={{ type: 'text', value: formData.nome, onChange: e => setFormData({ ...formData, nome: e.target.value }) }}
      />
      <CampoPerfil
        label="Usuário"
        valor={`@${usuario.usuario}`}
        isEditing={isEditing}
        inputProps={{ type: 'text', value: formData.usuario, onChange: e => setFormData({ ...formData, usuario: e.target.value }) }}
      />
      <CampoPerfil
        label="E-mail"
        valor={usuario.email || '—'}
        isEditing={isEditing}
        inputProps={{ type: 'email', value: formData.email, onChange: e => setFormData({ ...formData, email: e.target.value }) }}
      />
      <CampoPerfil
        label="Celular"
        valor={usuario.celular || '—'}
        isEditing={isEditing}
        inputProps={{ type: 'text', value: formData.celular, onChange: e => setFormData({ ...formData, celular: e.target.value }) }}
      />
      <CamposEnderecoPerfil
        isEditing={isEditing}
        enderecoAtual={usuario.endereco}
        formEndereco={formData.endereco}
        onChangeEndereco={(endereco) => setFormData({ ...formData, endereco })}
      />
      {isAdmin && (
        <CampoPerfil
          label="CPF"
          valor={usuario.cpf || '—'}
          isEditing={isEditing}
          inputProps={{ type: 'text', value: formData.cpf, onChange: e => setFormData({ ...formData, cpf: e.target.value }) }}
        />
      )}
    </>
  );

  const readonlyFields = (
    <>
      {!isAdmin && (
        <CampoPerfil label="CPF" valor={usuario.cpf || '—'} somenteLeitura readonlyColor={corSomenteLeitura} />
      )}
      <CampoPerfil
        label="Perfil"
        somenteLeitura
        valor={
          <Badge label={usuario.perfil} color={usuario.perfil === 'ADMINISTRADOR' ? 'danger' : usuario.perfil === 'MOTORISTA' ? 'warning' : 'info'} />
        }
      />
      <CampoPerfil label="Cadastro" valor={formatarData(usuario.criadoEm)} somenteLeitura readonlyColor={corSomenteLeitura} />
      {usuario.perfil === 'MOTORISTA' && (
        <CampoPerfil
          label="Motorista Vinculado"
          somenteLeitura
          valor={
            <button
              className="btn-link"
              onClick={usuario.onOpenMotorista}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Ver Perfil de Motorista
            </button>
          }
        />
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
      onStartEdit={iniciarEdicao}
      onCancelEdit={cancelarEdicao}
      onSave={salvarEdicao}
      hasChanges={hasChanges}
      editableFields={editableFields}
      readonlyFields={readonlyFields}
    />
  );
};
