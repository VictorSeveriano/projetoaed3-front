import React, { useState, useEffect } from 'react';
import Badge from '../Badge';
import { ModalPerfilBase } from './ModalPerfilBase';

const PORTES = [
  { value: 'Pequeno', label: 'Pequeno' },
  { value: 'Medio', label: 'Médio' },
  { value: 'Grande', label: 'Grande' },
];

const criarEstadoInicial = (veiculo) => ({
  marca: veiculo?.marca || '',
  modelo: veiculo?.modelo || '',
  ano: veiculo?.ano || '',
  placa: veiculo?.placa || '',
  cor: veiculo?.cor || '',
  porte: veiculo?.porte || '',
});

export const ModalPerfilVeiculo = ({ isOpen, onClose, veiculo, isAdmin = false, onSave, onVerMotorista }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => criarEstadoInicial(veiculo));

  useEffect(() => {
    if (veiculo) {
      setFormData(criarEstadoInicial(veiculo));
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
    (isAdmin && formData.porte !== (veiculo.porte || ''));

  const handleSave = async () => {
    const payload = isAdmin
      ? formData
      : (({ porte: _porteIgnorado, ...resto }) => resto)(formData);
    if (onSave) await onSave(veiculo.id, payload);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData(criarEstadoInicial(veiculo));
    setIsEditing(false);
  };

  const statusAprovLabel = { PENDENTE: 'Pendente', APROVADO: 'Aprovado', REJEITADO: 'Rejeitado' };
  const statusAprovColor = { PENDENTE: 'warning', APROVADO: 'success', REJEITADO: 'danger' };
  const statusOpLabel = { DISPONIVEL: 'Disponível', EM_CORRIDA: 'Em Corrida', INDISPONIVEL: 'Indisponível' };
  const statusOpColor = { DISPONIVEL: 'success', EM_CORRIDA: 'warning', INDISPONIVEL: 'muted' };
  const classeLabel = { BASICO: 'Básico', NORMAL: 'Normal', PREMIUM: 'Premium' };
  const classeColor = { BASICO: 'info', NORMAL: 'info', PREMIUM: 'warning' };
  const porteParaClasse = { Pequeno: 'BASICO', Medio: 'NORMAL', Grande: 'PREMIUM' };
  const classeExibida =
    isEditing && isAdmin && formData.porte && porteParaClasse[formData.porte]
      ? porteParaClasse[formData.porte]
      : veiculo.classe;

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
          {isEditing && isAdmin ? (
            <select className="input-field" style={{ padding: '4px', height: 'auto' }} value={formData.porte} onChange={e => setFormData({ ...formData, porte: e.target.value })}>
              <option value="" disabled>Selecione o porte...</option>
              {PORTES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          ) : <span>{PORTES.find(p => p.value === veiculo.porte)?.label || veiculo.porte || '—'}</span>}
        </span>
      </div>
    </>
  );

  const readonlyFields = (
    <>
      {fi('Classe de Serviço', <Badge label={classeLabel[classeExibida] || classeExibida || '—'} color={classeColor[classeExibida] || 'muted'} />)}
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
    <ModalPerfilBase
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil do Veículo"
      canEdit={isAdmin}
      isEditing={isEditing}
      onStartEdit={() => setIsEditing(true)}
      onCancelEdit={handleCancelEdit}
      onSave={handleSave}
      hasChanges={hasChanges}
      editableFields={editableFields}
      readonlyFields={readonlyFields}
    />
  );
};
