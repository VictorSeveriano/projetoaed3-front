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
  variant = 'warning', // 'warning', 'danger', 'info'
  icon,
  loading = false,
}) => {
  let IconComponent = Info;
  let iconColor = 'var(--text-secondary)';
  let confirmBtnVariant = 'primary';

  if (variant === 'warning') {
    IconComponent = TriangleAlert;
    iconColor = 'var(--color-warning)';
    confirmBtnVariant = 'primary';
  } else if (variant === 'danger') {
    IconComponent = Trash2;
    iconColor = 'var(--color-danger)';
    confirmBtnVariant = 'danger';
  }

  const FinalIcon = icon || IconComponent;

  const footer = (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="ghost" onClick={onClose} disabled={loading}>{cancelText}</Button>
      <Button variant={confirmBtnVariant} onClick={onConfirm} loading={loading}>{confirmText}</Button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={!loading ? onClose : () => {}} 
      title={title} 
      size="md" 
      footer={footer}
    >
      <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <FinalIcon size={56} color={iconColor} aria-hidden="true" />
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
