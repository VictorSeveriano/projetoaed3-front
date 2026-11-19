import React from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * ModalFeedback — Componente base de feedback (composição sobre Modal).
 * Centraliza a estrutura visual de modais de mensagem com ícone, texto e botão de confirmação.
 */
const ModalFeedback = ({
  isOpen,
  onClose,
  titulo,
  mensagem,
  tamanho = 'sm',
  IconComponent,
  iconColor,
  closeButtonId,
  textoBotao = 'Entendido',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size={tamanho}
      footer={
        <div className="modal-actions modal-actions--center">
          <Button
            id={closeButtonId}
            type="button"
            variant="primary"
            onClick={onClose}
            autoFocus
          >
            {textoBotao}
          </Button>
        </div>
      }
    >
      <div className="modal-feedback">
        {IconComponent && (
          <div className="modal-feedback__icon">
            <IconComponent
              size={32}
              color={iconColor}
              aria-hidden="true"
            />
          </div>
        )}
        <p className="modal-feedback__message">{mensagem}</p>
      </div>
    </Modal>
  );
};

export default ModalFeedback;
