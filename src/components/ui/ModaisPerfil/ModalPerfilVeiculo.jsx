import React, { useState } from 'react';
import Modal from '../Modal';
import Badge from '../Badge';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import ModalInformacao from '../ModalInformacao';
import { formatarData, formatarMoeda, STATUS_LABELS } from '../../../utils/formatters';

import { ModalPerfilBase } from './ModalPerfilBase';
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
