import React from 'react';
import Modal from './Modal';
import FormularioDadosPessoais from './FormularioDadosPessoais';

const ModalCadastroUsuario = ({
  isOpen, onClose, perfilSelecionado, 
  formCadastro, setFormCadastro,
  etapaCadastro, setEtapaCadastro,
  handleSaveNovoUsuario, salvandoCadastro
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Novo ${perfilSelecionado === 'USUARIO' ? 'Passageiro' : perfilSelecionado === 'MOTORISTA' ? 'Motorista' : 'Administrador'}`}
      size="lg"
    >
      <div style={{ padding: '0 8px' }}>
        <FormularioDadosPessoais
          form={formCadastro}
          setForm={setFormCadastro}
          perfil={perfilSelecionado}
          etapa={etapaCadastro}
          onAvancar={setEtapaCadastro}
          onVoltar={setEtapaCadastro}
          onSubmit={handleSaveNovoUsuario}
          loading={salvandoCadastro}
        />
      </div>
    </Modal>
  );
};

export default ModalCadastroUsuario;
