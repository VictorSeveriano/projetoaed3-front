import React, { useState } from 'react';
import Modal from '../Modal';
import Badge from '../Badge';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import ModalInformacao from '../ModalInformacao';
import { formatarData, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';

import { ModalPerfilBase } from './ModalPerfilBase';
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
