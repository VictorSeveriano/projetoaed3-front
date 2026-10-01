import React, { useState } from 'react';
import Modal from './Modal';
import Badge from './Badge';
import Button from './Button';
import ConfirmationModal from './ConfirmationModal';
import ModalInformacao from './ModalInformacao';
import { formatarData, formatarMoeda, STATUS_LABELS } from '../../utils/formatters';

export const ModalPerfilBase = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="perfil-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </Modal>
  );
};

export const ModalPerfilMotorista = ({ isOpen, onClose, motorista, isAdmin = true, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ cnh: '', cpf: '', nome: '', usuario: '', email: '', celular: '', endereco: {} });
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  React.useEffect(() => {
    if (motorista) {
      const u = motorista.usuario || {};
      setFormData({
        cnh: motorista.cnh || '',
        cpf: u.cpf || '',
        nome: u.nome || '',
        usuario: u.usuario || '',
        email: u.email || '',
        celular: u.celular || '',
        endereco: u.endereco || { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' }
      });
    }
    setIsEditing(false);
  }, [motorista]);

  if (!motorista) return null;

  const isAddressDifferent = (addr1, addr2) => {
    const a1 = addr1 || {};
    const a2 = addr2 || {};
    return a1.rua !== a2.rua || a1.bairro !== a2.bairro || a1.cidade !== a2.cidade || a1.estado !== a2.estado || a1.numero !== a2.numero || a1.cep !== a2.cep;
  };

  const u = motorista.usuario || {};
  const hasChanges = motorista.cnh !== formData.cnh || u.cpf !== formData.cpf || u.nome !== formData.nome || u.usuario !== formData.usuario || u.email !== formData.email || u.celular !== formData.celular || isAddressDifferent(u.endereco, formData.endereco);

  const handleClose = () => {
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setInfoOpen(true);
      return;
    }
    if (onSave) {
      await onSave(motorista.id, formData);
    }
    setIsEditing(false);
  };

  const editableFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Nome</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.nome || '—'}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Usuário</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.usuario} onChange={e => setFormData({ ...formData, usuario: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>@{u.usuario || '—'}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">E-mail</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="email" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.email || '—'}</span>
          )}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Celular</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing && isAdmin ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} />
          ) : (
            <span style={{ color: !isAdmin && isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.celular || '—'}</span>
          )}
        </span>
      </div>
      {isAdmin && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">CPF</span>
          <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing ? (
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
            ) : (
              <span>{u.cpf || '—'}</span>
            )}
          </span>
        </div>
      )}
      <div className="perfil-campo">
        <span className="perfil-campo__label">CNH</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input
              type="text"
              className="input-field"
              style={{ padding: '4px', height: 'auto', width: '100%' }}
              value={formData.cnh}
              onChange={e => setFormData({ ...formData, cnh: e.target.value })}
            />
          ) : (
            <span>{motorista.cnh || '—'}</span>
          )}
        </span>
      </div>
      {isAdmin && (
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
                {u.endereco ? (
                  <>
                    {u.endereco.rua}, {u.endereco.numero} - {u.endereco.bairro}<br />
                    {u.endereco.cidade}/{u.endereco.estado} - CEP: {u.endereco.cep}
                  </>
                ) : '—'}
              </span>
            )}
          </span>
        </div>
      )}
    </>
  );

  const readonlyFields = (
    <>
      {!isAdmin && (
        <>
          <div className="perfil-campo">
            <span className="perfil-campo__label">CPF</span>
            <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.cpf || '—'}</span>
          </div>
          <div className="perfil-campo">
            <span className="perfil-campo__label">Nome</span>
            <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.nome || '—'}</span>
          </div>
        </>
      )}
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cadastro</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{formatarData(motorista.criadoEm)}</span>
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
          ) : <span style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>Nenhum veículo associado</span>}
        </span>
      </div>
    </>
  );

  return (
    <>
      <ModalPerfilBase isOpen={isOpen} onClose={handleClose} title="Perfil do Motorista">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button size="sm" variant="success" onClick={handleSave}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setFormData({
                  cnh: motorista.cnh || '',
                  cpf: u.cpf || '',
                  nome: u.nome || '',
                  usuario: u.usuario || '',
                  email: u.email || '',
                  celular: u.celular || '',
                  endereco: u.endereco || { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' }
                });
                setIsEditing(false);
              }}>Cancelar</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
          )}
        </div>

        {isEditing ? (
          <>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Campos Editáveis</h3>
              <div className="perfil-grid">{editableFields}</div>
            </div>
            <div style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Campos Somente Leitura</h3>
              <div className="perfil-grid">{readonlyFields}</div>
            </div>
          </>
        ) : (
          <div className="perfil-grid">
            {editableFields}
            {readonlyFields}
          </div>
        )}
      </ModalPerfilBase>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Descartar alterações?"
        message="Você possui alterações não salvas. Deseja fechar e perder essas alterações?"
        onConfirm={() => {
          setShowConfirm(false);
          setIsEditing(false);
          onClose();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ModalInformacao
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        titulo="Nenhuma alteração"
        mensagem="Nenhum dado foi alterado. Modifique alguma informação antes de salvar."
      />
    </>
  );
};


export const ModalPerfilUsuario = ({ isOpen, onClose, usuario, isAdmin = true, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
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

  const isAddressDifferent = (addr1, addr2) => {
    const a1 = addr1 || {};
    const a2 = addr2 || {};
    return a1.rua !== a2.rua || a1.bairro !== a2.bairro || a1.cidade !== a2.cidade || a1.estado !== a2.estado || a1.numero !== a2.numero || a1.cep !== a2.cep;
  };

  const hasChanges = usuario.nome !== formData.nome || usuario.usuario !== formData.usuario || usuario.cpf !== formData.cpf || usuario.email !== formData.email || usuario.celular !== formData.celular || isAddressDifferent(usuario.endereco, formData.endereco);

  const handleClose = () => {
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setInfoOpen(true);
      return;
    }
    if (onSave) {
      await onSave(usuario.id, formData);
    }
    setIsEditing(false);
  };

  const editableFields = (
    <>
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
      {isAdmin && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">CPF</span>
          <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing ? (
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
            ) : <span>{usuario.cpf || '—'}</span>}
          </span>
        </div>
      )}
    </>
  );

  const readonlyFields = (
    <>
      {!isAdmin && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">CPF</span>
          <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{usuario.cpf || '—'}</span>
        </div>
      )}
      <div className="perfil-campo">
        <span className="perfil-campo__label">Perfil</span>
        <span className="perfil-campo__valor">
          <Badge label={usuario.perfil} color={usuario.perfil === 'ADMINISTRADOR' ? 'danger' : usuario.perfil === 'MOTORISTA' ? 'warning' : 'info'} />
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cadastro</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{formatarData(usuario.criadoEm)}</span>
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
    </>
  );

  return (
    <>
      <ModalPerfilBase isOpen={isOpen} onClose={handleClose} title="Perfil do Usuário">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button size="sm" variant="success" onClick={handleSave}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setFormData({
                  nome: usuario.nome || '', usuario: usuario.usuario || '', cpf: usuario.cpf || '',
                  email: usuario.email || '', celular: usuario.celular || '',
                  endereco: usuario.endereco || { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' }
                });
                setIsEditing(false);
              }}>Cancelar</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
          )}
        </div>

        {isEditing ? (
          <>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Campos Editáveis</h3>
              <div className="perfil-grid">{editableFields}</div>
            </div>
            <div style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Campos Somente Leitura</h3>
              <div className="perfil-grid">{readonlyFields}</div>
            </div>
          </>
        ) : (
          <div className="perfil-grid">
            {editableFields}
            {readonlyFields}
          </div>
        )}
      </ModalPerfilBase>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Descartar alterações?"
        message="Você possui alterações não salvas. Deseja fechar e perder essas alterações?"
        onConfirm={() => {
          setShowConfirm(false);
          setIsEditing(false);
          onClose();
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <ModalInformacao
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        titulo="Nenhuma alteração"
        mensagem="Nenhum dado foi alterado. Modifique alguma informação antes de salvar."
      />
    </>
  );
};

/** ─────────────────────────────────────────
 *  ModalPerfilVeiculo
 * ───────────────────────────────────────── */
export const ModalPerfilVeiculo = ({ isOpen, onClose, veiculo, isAdmin = false, onSave, onVerMotorista }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const PORTES = [
    { value: 'Pequeno', label: 'Pequeno' },
    { value: 'Medio', label: 'Médio' },
    { value: 'Grande', label: 'Grande' },
  ];

  React.useEffect(() => {
    if (veiculo) {
      setFormData({
        marca: veiculo.marca || '',
        modelo: veiculo.modelo || '',
        ano: veiculo.ano || '',
        placa: veiculo.placa || '',
        cor: veiculo.cor || '',
        porte: veiculo.porte || 'Pequeno',
      });
    }
    setIsEditing(false);
  }, [veiculo]);

  if (!veiculo) return null;

  const hasChanges =
    formData.marca !== (veiculo.marca || '') ||
    formData.modelo !== (veiculo.modelo || '') ||
    String(formData.ano) !== String(veiculo.ano || '') ||
    formData.placa !== (veiculo.placa || '') ||
    formData.cor !== (veiculo.cor || '') ||
    formData.porte !== (veiculo.porte || '');

  const handleClose = () => {
    if (isEditing && hasChanges) { setShowConfirm(true); } else { onClose(); }
  };

  const handleSave = async () => {
    if (!hasChanges) { setInfoOpen(true); return; }
    if (onSave) await onSave(veiculo.id, formData);
    setIsEditing(false);
  };

  const statusAprovLabel = { PENDENTE: 'Pendente', APROVADO: 'Aprovado', REJEITADO: 'Rejeitado' };
  const statusAprovColor = { PENDENTE: 'warning', APROVADO: 'success', REJEITADO: 'danger' };
  const statusOpLabel = { DISPONIVEL: 'Disponível', EM_CORRIDA: 'Em Corrida', INDISPONIVEL: 'Indisponível' };
  const statusOpColor = { DISPONIVEL: 'success', EM_CORRIDA: 'warning', INDISPONIVEL: 'muted' };
  const classeLabel = { BASICO: 'Básico', NORMAL: 'Normal', PREMIUM: 'Premium' };
  const classeColor = { BASICO: 'info', NORMAL: 'info', PREMIUM: 'warning' };

  const fi = (label, value) => (
    <div className="perfil-campo">
      <span className="perfil-campo__label">{label}</span>
      <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{value}</span>
    </div>
  );

  const editableFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Marca</span>
        <span className="perfil-campo__valor">
          {isEditing ? <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.marca} onChange={e => setFormData({ ...formData, marca: e.target.value })} /> : <span>{veiculo.marca || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Modelo</span>
        <span className="perfil-campo__valor">
          {isEditing ? <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.modelo} onChange={e => setFormData({ ...formData, modelo: e.target.value })} /> : <span>{veiculo.modelo || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Ano</span>
        <span className="perfil-campo__valor">
          {isEditing ? <input type="number" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.ano} onChange={e => setFormData({ ...formData, ano: e.target.value })} /> : <span>{veiculo.ano || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Placa</span>
        <span className="perfil-campo__valor">
          {isEditing ? <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.placa} onChange={e => setFormData({ ...formData, placa: e.target.value })} /> : <span>{veiculo.placa || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cor</span>
        <span className="perfil-campo__valor">
          {isEditing ? <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cor} onChange={e => setFormData({ ...formData, cor: e.target.value })} /> : <span>{veiculo.cor || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Porte</span>
        <span className="perfil-campo__valor">
          {isEditing ? (
            <select className="input-field" style={{ padding: '4px', height: 'auto' }} value={formData.porte} onChange={e => setFormData({ ...formData, porte: e.target.value })}>
              {PORTES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          ) : <span>{PORTES.find(p => p.value === veiculo.porte)?.label || veiculo.porte || '—'}</span>}
        </span>
      </div>
    </>
  );

  const readonlyFields = (
    <>
      {fi('Classe de Serviço', <Badge label={classeLabel[veiculo.classe] || veiculo.classe || '—'} color={classeColor[veiculo.classe] || 'muted'} />)}
      {fi('Quilometragem', veiculo.quilometragem ? `${veiculo.quilometragem} km` : '—')}
      {fi('Passageiros', veiculo.quantidadePassageiros || '—')}
      {fi('Ar-Condicionado', veiculo.possuiArCondicionado ? 'Sim' : 'Não')}
      {fi('Extintor', veiculo.possuiExtintor ? 'Sim' : 'Não')}
      {fi('Cinto de Segurança', veiculo.possuiCintoSeguranca ? 'Sim' : 'Não')}
      {fi('Documentação', <Badge label={veiculo.documentacaoRegularizada ? 'Regularizada' : 'Pendente'} color={veiculo.documentacaoRegularizada ? 'success' : 'warning'} />)}
      {fi('Aprovação', <Badge label={statusAprovLabel[veiculo.statusAprovacao] || veiculo.statusAprovacao || '—'} color={statusAprovColor[veiculo.statusAprovacao] || 'muted'} />)}
      {fi('Status', <Badge label={statusOpLabel[veiculo.status] || veiculo.status || '—'} color={statusOpColor[veiculo.status] || 'muted'} />)}
      {veiculo.motorista && (
        <div className="perfil-campo">
          <span className="perfil-campo__label">Motorista</span>
          <span className="perfil-campo__valor" style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: isEditing ? 'var(--text-muted)' : 'inherit' }}>
            <span>{veiculo.motorista.nome}</span>
            {onVerMotorista && (
              <button className="btn-link" onClick={onVerMotorista} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left' }}>
                Ver perfil
              </button>
            )}
          </span>
        </div>
      )}
    </>
  );

  return (
    <>
      <ModalPerfilBase isOpen={isOpen} onClose={handleClose} title="Perfil do Veículo">
        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="success" onClick={handleSave}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => { setFormData({ marca: veiculo.marca || '', modelo: veiculo.modelo || '', ano: veiculo.ano || '', placa: veiculo.placa || '', cor: veiculo.cor || '', porte: veiculo.porte || 'Pequeno' }); setIsEditing(false); }}>Cancelar</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
            )}
          </div>
        )}

        {isEditing ? (
          <>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Campos Editáveis</h3>
              <div className="perfil-grid">{editableFields}</div>
            </div>
            <div style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Campos Somente Leitura</h3>
              <div className="perfil-grid">{readonlyFields}</div>
            </div>
          </>
        ) : (
          <div className="perfil-grid">
            {editableFields}
            {readonlyFields}
          </div>
        )}
      </ModalPerfilBase>

      <ConfirmationModal
        isOpen={showConfirm}
        title="Descartar alterações?"
        message="Você possui alterações não salvas. Deseja fechar e perder essas alterações?"
        onConfirm={() => { setShowConfirm(false); setIsEditing(false); onClose(); }}
        onCancel={() => setShowConfirm(false)}
      />
      <ModalInformacao
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        titulo="Nenhuma alteração"
        mensagem="Nenhum dado foi alterado. Modifique alguma informação antes de salvar."
      />
    </>
  );
};
