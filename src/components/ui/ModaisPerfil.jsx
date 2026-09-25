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

  // Sync state if veiculo changes
  React.useEffect(() => {
    setIsEditing(false);
  }, [veiculo]);

  if (!veiculo) return null;

  const handleSave = async () => {
    // onSaveClasse is now handled mostly automatically by the backend via derivation,
    // so this is left for any future generic updates on the vehicle.
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
          {veiculo.porte || '—'} / <Badge label={veiculo.classe || 'N/D'} color="info" />
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cor</span>
        <span className="perfil-campo__valor">{veiculo.cor || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Quilometragem</span>
        <span className="perfil-campo__valor">{veiculo.quilometragem ? `${veiculo.quilometragem} km` : '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Passageiros</span>
        <span className="perfil-campo__valor">{veiculo.quantidadePassageiros || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Itens de Segurança</span>
        <span className="perfil-campo__valor">
          Ar-Condicionado: {veiculo.possuiArCondicionado ? 'Sim' : 'Não'}<br/>
          Extintor: {veiculo.possuiExtintor ? 'Sim' : 'Não'}<br/>
          Cinto Segurança: {veiculo.possuiCintoSeguranca ? 'Sim' : 'Não'}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Documentação</span>
        <span className="perfil-campo__valor">{veiculo.documentacaoRegularizada ? 'Regularizada' : 'Pendente/Irregular'}</span>
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
  const [formData, setFormData] = useState({ nome: '', usuario: '', cpf: '', email: '', celular: '', endereco: {} });

  React.useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        usuario: usuario.usuario || '',
        cpf: usuario.cpf || '',
        email: usuario.email || '',
        celular: usuario.celular || '',
        endereco: usuario.endereco || { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' }
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
        <span className="perfil-campo__label">E-mail</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="email" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          ) : <span>{usuario.email || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Celular</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} />
          ) : <span>{usuario.celular || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Endereço</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isEditing ? (
            <>
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Rua" value={formData.endereco.rua || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })} />
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Bairro" value={formData.endereco.bairro || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Número" value={formData.endereco.numero || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })} />
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="CEP" value={formData.endereco.cep || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Cidade" value={formData.endereco.cidade || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })} />
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="UF" value={formData.endereco.estado || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value } })} />
              </div>
            </>
          ) : (
            <span>
              {usuario.endereco ? (
                <>
                  {usuario.endereco.rua}, {usuario.endereco.numero} - {usuario.endereco.bairro}<br />
                  {usuario.endereco.cidade}/{usuario.endereco.estado} - CEP: {usuario.endereco.cep}
                </>
              ) : '—'}
            </span>
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
