import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal — Componente base reutilizável de diálogo.
 *
 * Melhorias de acessibilidade:
 * - titleId gerado dinamicamente via useId() para evitar IDs duplicados
 *   quando múltiplos modais são abertos simultaneamente
 * - Fecha no ESC
 * - Devolve o foco ao elemento que estava ativo antes de abrir o modal
 * - Bloqueia scroll do body enquanto aberto
 *
 * Props:
 * @param {boolean}   isOpen   - Controla visibilidade
 * @param {function}  onClose  - Callback ao fechar
 * @param {string}    title    - Título do diálogo
 * @param {ReactNode} children - Conteúdo do corpo
 * @param {ReactNode} footer   - Conteúdo do rodapé
 * @param {string}    size     - 'sm' | 'md' | 'lg' (padrão: 'md')
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const generatedId = useId();
  const titleId = 'modal-title-' + generatedId.replace(/:/g, '');
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Salva o elemento com foco antes de abrir o modal
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Devolve o foco ao elemento anterior ao fechar
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Fechar modal">✕</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
