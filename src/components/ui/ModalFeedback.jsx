import React from 'react';
import Modal from './Modal';

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
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            id={closeButtonId}
            className="btn btn-primary"
            onClick={onClose}
            autoFocus
          >
            {textoBotao}
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        {IconComponent && (
          <div style={{ marginBottom: '20px' }}>
            <IconComponent
              size={56}
              color={iconColor}
              aria-hidden="true"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>
        )}
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            whiteSpace: 'pre-line',
          }}
        >
          {mensagem}
        </p>
      </div>
    </Modal>
  );
};

export default ModalFeedback;

