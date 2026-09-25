import React, { useState } from 'react';
import Modal from './Modal';
import Badge from './Badge';
import Button from './Button';
import { formatarData, formatarMoeda, STATUS_LABELS } from '../../utils/formatters';

export const ModalPerfilBase = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="perfil-grid">
        {children}
      </div>
    </Modal>
  );
};

export const ModalPerfilMotorista = ({ isOpen, onClose, motorista }) => {
  if (!motorista) return null;

  return (
    <ModalPerfilBase isOpen={isOpen} onClose={onClose} title="Perfil do Motorista">
      <div className="perfil-campo">
        <span className="perfil-campo__label">Nome</span>
        <span className="perfil-campo__valor">{motorista.usuario?.nome || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Usuário</span>
        <span className="perfil-campo__valor">@{motorista.usuario?.usuario || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">CNH</span>
        <span className="perfil-campo__valor">{motorista.cnh || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cadastro</span>
        <span className="perfil-campo__valor">{formatarData(motorista.criadoEm)}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Status</span>
        <div>
          <Badge label={motorista.statusCadastro} color={
            motorista.statusCadastro === 'APROVADO' ? 'success' : 
            motorista.statusCadastro === 'PENDENTE' ? 'warning' : 'danger'
          } />
        </div>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Veículo</span>
        <span className="perfil-campo__valor">
          {motorista.veiculo ? (
            <button 
              className="btn-link"
              onClick={motorista.onOpenVeiculo}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              {motorista.veiculo.marca} {motorista.veiculo.modelo} ({motorista.veiculo.placa})
            </button>
          ) : 'Nenhum veículo associado'}
        </span>
      </div>
    </ModalPerfilBase>
  );
};

export const ModalPerfilVeiculo = ({ isOpen, onClose, veiculo, isAdmin, onSaveClasse }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [classe, setClasse] = useState(veiculo?.classe || 'BASICO');

  // Sync state if veiculo changes
  React.useEffect(() => {
    if (veiculo) setClasse(veiculo.classe || 'BASICO');
    setIsEditing(false);
  }, [veiculo]);

  if (!veiculo) return null;

  const handleSave = async () => {
    if (onSaveClasse) {
      await onSaveClasse(veiculo.id, classe);
    }
    setIsEditing(false);
  };

  const statusInfo = STATUS_LABELS[veiculo.status] || { label: veiculo.status, color: 'muted' };

  return (
    <ModalPerfilBase isOpen={isOpen} onClose={onClose} title="Perfil do Veículo">
      <div className="perfil-campo">
        <span className="perfil-campo__label">Modelo/Marca</span>
        <span className="perfil-campo__valor">{veiculo.marca} {veiculo.modelo}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Placa</span>
        <span className="perfil-campo__valor">{veiculo.placa}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Ano</span>
        <span className="perfil-campo__valor">{veiculo.ano}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Porte / Classe</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {veiculo.porte || '—'} / 
          {isEditing ? (
            <select 
              className="input-field" 
              style={{ padding: '4px', height: 'auto', width: 'auto' }}
              value={classe}
              onChange={e => setClasse(e.target.value)}
            >
              <option value="BASICO">Básico</option>
              <option value="NORMAL">Normal</option>
              <option value="PREMIUM">Premium</option>
            </select>
          ) : (
            <Badge label={veiculo.classe || 'N/D'} color="info" />
          )}
          
          {isAdmin && (
            isEditing ? (
              <Button size="sm" variant="success" onClick={handleSave}>Salvar</Button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
              >
                Editar
              </button>
            )
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Aprovação</span>
        <div>
          <Badge label={veiculo.statusAprovacao || 'PENDENTE'} color={veiculo.statusAprovacao === 'APROVADO' ? 'success' : 'warning'} />
        </div>
      </div>

      <div className="perfil-campo">
        <span className="perfil-campo__label">Motorista</span>
        <span className="perfil-campo__valor">{veiculo.motorista?.nome || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Status Operacional</span>
        <div>
          <Badge label={statusInfo.label} color={statusInfo.color} />
        </div>
      </div>
    </ModalPerfilBase>
  );
};

export const ModalPerfilUsuario = ({ isOpen, onClose, usuario, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nome: '', usuario: '' });

  React.useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        usuario: usuario.usuario || ''
      });
    }
    setIsEditing(false);
  }, [usuario]);

  if (!usuario) return null;

  const handleSave = async () => {
    if (onSave) {
      await onSave(usuario.id, formData);
    }
    setIsEditing(false);
  };

  return (
    <ModalPerfilBase isOpen={isOpen} onClose={onClose} title="Perfil do Usuário">
      <div className="perfil-campo">
        <span className="perfil-campo__label">Nome Completo</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input 
              type="text" 
              className="input-field" 
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
            />
          ) : (
            <span>{usuario.nome}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Usuário</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input 
              type="text" 
              className="input-field" 
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              value={formData.usuario}
              onChange={e => setFormData({ ...formData, usuario: e.target.value })}
            />
          ) : (
            <span>@{usuario.usuario}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Perfil</span>
        <span className="perfil-campo__valor">
          <Badge label={usuario.perfil} color={usuario.perfil === 'ADMINISTRADOR' ? 'danger' : usuario.perfil === 'MOTORISTA' ? 'warning' : 'info'} />
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cadastro</span>
        <span className="perfil-campo__valor">{formatarData(usuario.criadoEm)}</span>
      </div>
      {usuario.perfil === 'MOTORISTA' && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">Motorista Vinculado</span>
          <span className="perfil-campo__valor">
            <button 
              className="btn-link"
              onClick={usuario.onOpenMotorista}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Ver Perfil de Motorista
            </button>
          </span>
        </div>
      )}
      
      <div className="perfil-campo" style={{ marginTop: '16px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="success" onClick={handleSave}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
        )}
      </div>
    </ModalPerfilBase>
  );
};
