import React from 'react';
import Modal from './Modal';
import { User, Car, Shield } from 'lucide-react';

const ModalEscolhaPerfil = ({ isOpen, onClose, onSelect }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Escolha o perfil"
      size="sm"
    >
      <style>{`
        .profile-select-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 16px;
          background-color: var(--bg-800);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          color: var(--text-primary);
        }
        .profile-select-btn:hover {
          border-color: var(--color-primary-glow);
          background-color: var(--bg-700);
          transform: translateY(-2px);
        }
        .profile-select-btn:active,
        .profile-select-btn:focus-visible {
          outline: none;
          border-color: var(--color-primary);
          background-color: var(--bg-700);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
        }
        .profile-select-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: rgba(99, 102, 241, 0.1);
          color: var(--color-primary);
          flex-shrink: 0;
        }
        .profile-select-title {
          font-weight: 600;
          font-size: 1rem;
          display: block;
          margin-bottom: 2px;
          color: var(--text-primary);
        }
        .profile-select-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: block;
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0 16px' }}>
        <button className="profile-select-btn" onClick={() => onSelect('USUARIO')}>
          <div className="profile-select-icon">
            <User size={24} />
          </div>
          <div>
            <span className="profile-select-title">Passageiro</span>
            <span className="profile-select-desc">Solicita viagens no sistema</span>
          </div>
        </button>
        
        <button className="profile-select-btn" onClick={() => onSelect('MOTORISTA')}>
          <div className="profile-select-icon">
            <Car size={24} />
          </div>
          <div>
            <span className="profile-select-title">Motorista</span>
            <span className="profile-select-desc">Realiza as viagens para os passageiros</span>
          </div>
        </button>
        
        <button className="profile-select-btn" onClick={() => onSelect('ADMINISTRADOR')}>
          <div className="profile-select-icon">
            <Shield size={24} />
          </div>
          <div>
            <span className="profile-select-title">Administrador</span>
            <span className="profile-select-desc">Gerencia usuários e sistema</span>
          </div>
        </button>
      </div>
    </Modal>
  );
};

export default ModalEscolhaPerfil;
