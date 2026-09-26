import React from 'react';
import Modal from './Modal';
import { XCircle } from 'lucide-react';

/**
 * ModalErro — Modal especializado para exibição de mensagens de erro.
 *
 * Herda toda a estrutura base do Modal (overlay, centralização, ESC,
 * acessibilidade, controle de foco, responsividade) e adiciona
 * estética de erro: ícone, cor e layout padronizados.
 *
 * Estrutura de herança via composição:
 *   Modal (base)
 *     └── ModalErro (especialização para erros)
 *
 * Outros modais de erro futuros podem usar este mesmo padrão.
 *
 * Props:
 * @param {boolean}  isOpen    - Controla visibilidade
 * @param {function} onClose   - Callback ao fechar
 * @param {string}   titulo    - Título do erro (padrão: 'Erro')
 * @param {string}   mensagem  - Mensagem de erro a exibir
 * @param {string}   [tamanho] - 'sm' | 'md' | 'lg' (padrão: 'sm')
 */
const ModalErro = ({ isOpen, onClose, titulo = 'Erro', mensagem, tamanho = 'sm' }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size={tamanho}
      footer={
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            id="btn-modal-erro-fechar"
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
          <XCircle
            size={56}
            color="var(--color-danger)"
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

export default ModalErro;
