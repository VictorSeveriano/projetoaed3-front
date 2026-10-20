import React from 'react';
import { Info } from 'lucide-react';
import ModalFeedback from './ModalFeedback';

/**
 * ModalInformacao — Especialização de ModalFeedback para exibição de avisos e informações.
 */
const ModalInformacao = ({ isOpen, onClose, titulo = 'Aviso', mensagem, tamanho = 'sm' }) => (
  <ModalFeedback
    isOpen={isOpen}
    onClose={onClose}
    titulo={titulo}
    mensagem={mensagem}
    tamanho={tamanho}
    IconComponent={Info}
    iconColor="var(--color-info)"
    closeButtonId="btn-modal-informacao-fechar"
  />
);

export default ModalInformacao;
