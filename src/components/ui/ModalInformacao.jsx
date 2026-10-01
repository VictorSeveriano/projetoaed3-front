import React from 'react';
import Modal from './Modal';
import { Info } from 'lucide-react';

/**
 * ModalInformacao — Modal especializado para exibição de mensagens informativas ou de validação de interface.
 *
 * Herda a estrutura base do Modal.
 *
 * Props:
 * @param {boolean}  isOpen    - Controla visibilidade
 * @param {function} onClose   - Callback ao fechar
 * @param {string}   titulo    - Título do modal (padrão: 'Aviso')
 * @param {string}   mensagem  - Mensagem a exibir
 * @param {string}   [tamanho] - 'sm' | 'md' | 'lg' (padrão: 'sm')
 */
const ModalInformacao = ({ isOpen, onClose, titulo = 'Aviso', mensagem, tamanho = 'sm' }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size={tamanho}
      footer={
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            id="btn-modal-informacao-fechar"
            className="btn btn-primary"
            onClick={onClose}
            autoFocus
          >
            Entendido
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Info
            size={56}
            color="var(--color-info)"
            aria-hidden="true"
            style={{ display: 'block', margin: '0 auto' }}
          />
        </div>
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

export default ModalInformacao;
