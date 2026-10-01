import React, { useState } from 'react';
import Modal from '../Modal';
import Badge from '../Badge';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import ModalInformacao from '../ModalInformacao';
import { formatarData, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';

export const ModalPerfilBase = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="perfil-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </Modal>
  );
};

