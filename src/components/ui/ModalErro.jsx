import React from 'react';
import { XCircle } from 'lucide-react';
import ModalFeedback from './ModalFeedback';

/**
 * ModalErro — Especialização de ModalFeedback para exibição de mensagens de erro.
 */
const ModalErro = ({ isOpen, onClose, titulo = 'Erro', mensagem, tamanho = 'sm' }) => (
  <ModalFeedback
    isOpen={isOpen}
    onClose={onClose}
    titulo={titulo}
    mensagem={mensagem}
    tamanho={tamanho}
    IconComponent={XCircle}
    iconColor="var(--color-danger)"
    closeButtonId="btn-modal-erro-fechar"
  />
);

export default ModalErro;
