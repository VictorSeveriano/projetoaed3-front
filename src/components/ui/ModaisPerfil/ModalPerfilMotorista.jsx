import React, { useCallback } from 'react';
import Badge from '../Badge';
import { formatarData } from '../../../utils/formatters';
import { ModalPerfilBase } from './ModalPerfilBase';
import { CamposEnderecoPerfil } from '../CamposEnderecoPerfil';
import { ENDERECO_VAZIO, isAddressDifferent } from '../../../utils/endereco';
import { useModalEdicao } from '../../../hooks/useModalEdicao';
import CampoPerfil from '../CampoPerfil';

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
  const estadoInicial = useCallback((item) => criarEstadoInicial(item), []);
  const {
    isEditing,
    formData,
    setFormData,
    iniciarEdicao,
    cancelarEdicao,
    salvarEdicao,
  } = useModalEdicao({
    item: motorista,
    criarEstadoInicial: estadoInicial,
    onSave,
  });

  if (!motorista) return null;

  const u = motorista.usuario || {};
  const corSomenteLeitura = isEditing ? 'var(--text-muted)' : undefined;
  const hasChanges =
    (motorista.cnh || '') !== formData.cnh ||
    (u.cpf || '') !== formData.cpf ||
    (u.nome || '') !== formData.nome ||
    (u.usuario || '') !== formData.usuario ||
    (u.email || '') !== formData.email ||
    (u.celular || '') !== formData.celular ||
    isAddressDifferent(u.endereco, formData.endereco);

  const editableFields = (
    <>
      <CampoPerfil
        label="Nome"
        valor={u.nome || '—'}
        isEditing={isEditing && isAdmin}
        inputProps={{ type: 'text', value: formData.nome, onChange: e => setFormData({ ...formData, nome: e.target.value }) }}
        readonlyColor={!isAdmin && isEditing ? 'var(--text-muted)' : undefined}
      />
      <CampoPerfil
        label="Usuário"
        valor={`@${u.usuario || '—'}`}
        isEditing={isEditing && isAdmin}
        inputProps={{ type: 'text', value: formData.usuario, onChange: e => setFormData({ ...formData, usuario: e.target.value }) }}
        readonlyColor={!isAdmin && isEditing ? 'var(--text-muted)' : undefined}
      />
      <CampoPerfil
        label="E-mail"
        valor={u.email || '—'}
        isEditing={isEditing && isAdmin}
        inputProps={{ type: 'email', value: formData.email, onChange: e => setFormData({ ...formData, email: e.target.value }) }}
        readonlyColor={!isAdmin && isEditing ? 'var(--text-muted)' : undefined}
      />
      <CampoPerfil
        label="Celular"
        valor={u.celular || '—'}
        isEditing={isEditing && isAdmin}
        inputProps={{ type: 'text', value: formData.celular, onChange: e => setFormData({ ...formData, celular: e.target.value }) }}
        readonlyColor={!isAdmin && isEditing ? 'var(--text-muted)' : undefined}
      />
      {isAdmin && (
        <CampoPerfil
          label="CPF"
          valor={u.cpf || '—'}
          isEditing={isEditing}
          inputProps={{ type: 'text', value: formData.cpf, onChange: e => setFormData({ ...formData, cpf: e.target.value }) }}
        />
      )}
      <CampoPerfil
        label="CNH"
        valor={motorista.cnh || '—'}
        isEditing={isEditing}
        inputProps={{ type: 'text', value: formData.cnh, onChange: e => setFormData({ ...formData, cnh: e.target.value }) }}
      />
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
          <CampoPerfil label="CPF" valor={u.cpf || '—'} somenteLeitura readonlyColor={corSomenteLeitura} />
          <CampoPerfil label="Nome" valor={u.nome || '—'} somenteLeitura readonlyColor={corSomenteLeitura} />
        </>
      )}
      <CampoPerfil label="Cadastro" valor={formatarData(motorista.criadoEm)} somenteLeitura readonlyColor={corSomenteLeitura} />
      <CampoPerfil
        label="Status"
        somenteLeitura
        valor={
          <Badge label={motorista.statusCadastro} color={
            motorista.statusCadastro === 'APROVADO' ? 'success' :
              motorista.statusCadastro === 'PENDENTE' ? 'warning' : 'danger'
          } />
        }
      />
      <CampoPerfil
        label="Veículo"
        somenteLeitura
        valor={
          motorista.veiculo ? (
            <button
              className="btn-link"
              onClick={motorista.onOpenVeiculo}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              {motorista.veiculo.marca} {motorista.veiculo.modelo} ({motorista.veiculo.placa})
            </button>
          ) : (
            <span style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>Nenhum veículo associado</span>
          )
        }
      />
    </>
  );

  return (
    <ModalPerfilBase
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil do Motorista"
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
