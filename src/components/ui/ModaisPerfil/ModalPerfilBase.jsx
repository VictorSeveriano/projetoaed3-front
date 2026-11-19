import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import ModalInformacao from '../ModalInformacao';

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
        <div className="perfil-stack">
          {canEdit && (
            <div className="form-actions" style={{ marginTop: 0 }}>
              {isEditing ? (
                <div className="btn-group">
                  <Button type="button" size="sm" variant="outline" onClick={onCancelEdit}>
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" variant="success" onClick={handleSaveClick}>
                    Salvar
                  </Button>
                </div>
              ) : (
                <Button type="button" size="sm" variant="outline" onClick={onStartEdit}>
                  Editar Dados
                </Button>
              )}
            </div>
          )}

          {editableFields || readonlyFields ? (
            isEditing ? (
              <>
                <div className="perfil-section">
                  <h3 className="perfil-section__title">Campos Editáveis</h3>
                  <div className="perfil-grid">{editableFields}</div>
                </div>
                <div className="perfil-section perfil-section--readonly">
                  <h3 className="perfil-section__title perfil-section__title--muted">
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
