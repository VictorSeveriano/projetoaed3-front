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
      <div className="profile-select-list">
        <button type="button" className="profile-select-btn" onClick={() => onSelect('USUARIO')}>
          <div className="profile-select-icon" aria-hidden="true">
            <User size={22} />
          </div>
          <div>
            <span className="profile-select-title">Passageiro</span>
            <span className="profile-select-desc">Solicita viagens no sistema</span>
          </div>
        </button>

        <button type="button" className="profile-select-btn" onClick={() => onSelect('MOTORISTA')}>
          <div className="profile-select-icon" aria-hidden="true">
            <Car size={22} />
          </div>
          <div>
            <span className="profile-select-title">Motorista</span>
            <span className="profile-select-desc">Realiza as viagens para os passageiros</span>
          </div>
        </button>

        <button type="button" className="profile-select-btn" onClick={() => onSelect('ADMINISTRADOR')}>
          <div className="profile-select-icon" aria-hidden="true">
            <Shield size={22} />
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
