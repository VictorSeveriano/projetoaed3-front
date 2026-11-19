import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { TriangleAlert, Trash2, Info } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning', // 'warning', 'danger', 'info', 'primary'
  icon,
  loading = false,
}) => {
  let IconComponent = Info;
  let iconColor = 'var(--color-info-light)';
  let confirmBtnVariant = 'primary';

  if (variant === 'warning') {
    IconComponent = TriangleAlert;
    iconColor = 'var(--color-warning-light)';
    confirmBtnVariant = 'primary';
  } else if (variant === 'danger') {
    IconComponent = Trash2;
    iconColor = 'var(--color-danger-light)';
    confirmBtnVariant = 'danger';
  }

  const FinalIcon = icon || IconComponent;

  const footer = (
    <div className="modal-actions">
      <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button type="button" variant={confirmBtnVariant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={!loading ? onClose : () => {}}
      title={title}
      size="sm"
      footer={footer}
    >
      <div className="modal-feedback">
        <div className="modal-feedback__icon">
          <FinalIcon size={32} color={iconColor} aria-hidden="true" />
        </div>
        <p className="modal-feedback__message">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
