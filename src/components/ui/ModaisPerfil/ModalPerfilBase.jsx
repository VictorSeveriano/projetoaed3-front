import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import ModalInformacao from '../ModalInformacao';

export const ENDERECO_VAZIO = {
  rua: '',
  bairro: '',
  cidade: '',
  estado: '',
  numero: '',
  cep: '',
};

export const isAddressDifferent = (addr1, addr2) => {
  const a1 = addr1 || {};
  const a2 = addr2 || {};
  return (
    (a1.rua || '') !== (a2.rua || '') ||
    (a1.bairro || '') !== (a2.bairro || '') ||
    (a1.cidade || '') !== (a2.cidade || '') ||
    (a1.estado || '') !== (a2.estado || '') ||
    (a1.numero || '') !== (a2.numero || '') ||
    (a1.cep || '') !== (a2.cep || '')
  );
};

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

/**
 * ModalPerfilBase — Componente base para os modais de perfil (Motorista, Usuário e Veículo).
 * Centraliza a barra de edição, a divisão entre campos editáveis e somente leitura,
 * e os modais de confirmação de descarte e aviso de ausência de alterações.
 */
export const ModalPerfilBase = ({
  isOpen,
  onClose,
  title,
  canEdit = false,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  hasChanges = false,
  editableFields,
  readonlyFields,
  children,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleClose = () => {
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSaveClick = async () => {
    if (!hasChanges) {
      setInfoOpen(true);
      return;
    }
    if (onSave) {
      await onSave();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
        <div className="perfil-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {canEdit && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="success" onClick={handleSaveClick}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancelEdit}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={onStartEdit}>
                  Editar Dados
                </Button>
              )}
            </div>
          )}

          {editableFields || readonlyFields ? (
            isEditing ? (
              <>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Campos Editáveis
                  </h3>
                  <div className="perfil-grid">{editableFields}</div>
                </div>
                <div style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
                    Campos Somente Leitura
                  </h3>
                  <div className="perfil-grid">{readonlyFields}</div>
                </div>
              </>
            ) : (
              <div className="perfil-grid">
                {editableFields}
                {readonlyFields}
              </div>
            )
          ) : (
            children
          )}
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Descartar alterações?"
        message="Você possui alterações não salvas. Deseja fechar e perder essas alterações?"
        onConfirm={() => {
          setShowConfirm(false);
          if (onCancelEdit) onCancelEdit();
          onClose();
        }}
        onClose={() => setShowConfirm(false)}
      />

      <ModalInformacao
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        titulo="Nenhuma alteração"
        mensagem="Nenhum dado foi alterado. Modifique alguma informação antes de salvar."
      />
    </>
  );
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

/**
 * ModalPerfilBase — Componente base para os modais de perfil (Motorista, Usuário e Veículo).
 * Centraliza a barra de edição, a divisão entre campos editáveis e somente leitura,
 * e os modais de confirmação de descarte e aviso de ausência de alterações.
 */
export const ModalPerfilBase = ({
  isOpen,
  onClose,
  title,
  canEdit = false,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  hasChanges = false,
  editableFields,
  readonlyFields,
  children,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleClose = () => {
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSaveClick = async () => {
    if (!hasChanges) {
      setInfoOpen(true);
      return;
    }
    if (onSave) {
      await onSave();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
        <div className="perfil-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {canEdit && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="success" onClick={handleSaveClick}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancelEdit}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={onStartEdit}>
                  Editar Dados
                </Button>
              )}
            </div>
          )}

          {editableFields || readonlyFields ? (
            isEditing ? (
              <>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Campos Editáveis
                  </h3>
                  <div className="perfil-grid">{editableFields}</div>
                </div>
                <div style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
                    Campos Somente Leitura
                  </h3>
                  <div className="perfil-grid">{readonlyFields}</div>
                </div>
              </>
            ) : (
              <div className="perfil-grid">
                {editableFields}
                {readonlyFields}
              </div>
            )
          ) : (
            children
          )}
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Descartar alterações?"
        message="Você possui alterações não salvas. Deseja fechar e perder essas alterações?"
        onConfirm={() => {
          setShowConfirm(false);
          if (onCancelEdit) onCancelEdit();
          onClose();
        }}
        onClose={() => setShowConfirm(false)}
      />

      <ModalInformacao
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        titulo="Nenhuma alteração"
        mensagem="Nenhum dado foi alterado. Modifique alguma informação antes de salvar."
      />
    </>
  );
};

