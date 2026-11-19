import React, { useCallback } from 'react';
import Badge from '../Badge';
import { ModalPerfilBase } from './ModalPerfilBase';
import { useModalEdicao } from '../../../hooks/useModalEdicao';
import CampoPerfil from '../CampoPerfil';

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
  const estadoInicial = useCallback((item) => criarEstadoInicial(item), []);
  const transformarPayload = useCallback(
    (dados) => (isAdmin ? dados : (({ porte: _porteIgnorado, ...resto }) => resto)(dados)),
    [isAdmin]
  );

  const {
    isEditing,
    formData,
    setFormData,
    iniciarEdicao,
    cancelarEdicao,
    salvarEdicao,
  } = useModalEdicao({
    item: veiculo,
    criarEstadoInicial: estadoInicial,
    onSave,
    transformarPayload,
  });

  if (!veiculo) return null;

  const corSomenteLeitura = isEditing ? 'var(--text-muted)' : undefined;
  const hasChanges =
    formData.marca !== (veiculo.marca || '') ||
    formData.modelo !== (veiculo.modelo || '') ||
    String(formData.ano) !== String(veiculo.ano || '') ||
    formData.placa !== (veiculo.placa || '') ||
    formData.cor !== (veiculo.cor || '') ||
    (isAdmin && formData.porte !== (veiculo.porte || ''));

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

  const editableFields = (
    <>
      <CampoPerfil label="Marca"  valor={veiculo.marca  || '—'} isEditing={isEditing} inputProps={{ type: 'text',   value: formData.marca,  onChange: e => setFormData({ ...formData, marca:  e.target.value }) }} />
      <CampoPerfil label="Modelo" valor={veiculo.modelo || '—'} isEditing={isEditing} inputProps={{ type: 'text',   value: formData.modelo, onChange: e => setFormData({ ...formData, modelo: e.target.value }) }} />
      <CampoPerfil label="Ano"    valor={veiculo.ano    || '—'} isEditing={isEditing} inputProps={{ type: 'number', value: formData.ano,    onChange: e => setFormData({ ...formData, ano:    e.target.value }) }} />
      <CampoPerfil label="Placa"  valor={veiculo.placa  || '—'} isEditing={isEditing} inputProps={{ type: 'text',   value: formData.placa,  onChange: e => setFormData({ ...formData, placa:  e.target.value }) }} />
      <CampoPerfil label="Cor"    valor={veiculo.cor    || '—'} isEditing={isEditing} inputProps={{ type: 'text',   value: formData.cor,    onChange: e => setFormData({ ...formData, cor:    e.target.value }) }} />
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
      <CampoPerfil label="Classe de Serviço" somenteLeitura readonlyColor={corSomenteLeitura} valor={<Badge label={classeLabel[classeExibida] || classeExibida || '—'} color={classeColor[classeExibida] || 'muted'} />} />
      <CampoPerfil label="Quilometragem"     somenteLeitura readonlyColor={corSomenteLeitura} valor={veiculo.quilometragem ? `${veiculo.quilometragem} km` : '—'} />
      <CampoPerfil label="Passageiros"       somenteLeitura readonlyColor={corSomenteLeitura} valor={veiculo.quantidadePassageiros || '—'} />
      <CampoPerfil label="Ar-Condicionado"   somenteLeitura readonlyColor={corSomenteLeitura} valor={veiculo.possuiArCondicionado ? 'Sim' : 'Não'} />
      <CampoPerfil label="Extintor"          somenteLeitura readonlyColor={corSomenteLeitura} valor={veiculo.possuiExtintor ? 'Sim' : 'Não'} />
      <CampoPerfil label="Cinto de Segurança" somenteLeitura readonlyColor={corSomenteLeitura} valor={veiculo.possuiCintoSeguranca ? 'Sim' : 'Não'} />
      <CampoPerfil label="Documentação"      somenteLeitura readonlyColor={corSomenteLeitura} valor={<Badge label={veiculo.documentacaoRegularizada ? 'Regularizada' : 'Pendente'} color={veiculo.documentacaoRegularizada ? 'success' : 'warning'} />} />
      <CampoPerfil label="Aprovação"         somenteLeitura readonlyColor={corSomenteLeitura} valor={<Badge label={statusAprovLabel[veiculo.statusAprovacao] || veiculo.statusAprovacao || '—'} color={statusAprovColor[veiculo.statusAprovacao] || 'muted'} />} />
      <CampoPerfil label="Status"            somenteLeitura readonlyColor={corSomenteLeitura} valor={<Badge label={statusOpLabel[veiculo.status] || veiculo.status || '—'} color={statusOpColor[veiculo.status] || 'muted'} />} />
      {veiculo.motorista && (
        <CampoPerfil
          label="Motorista"
          somenteLeitura
          readonlyColor={corSomenteLeitura}
          valor={
            <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>{veiculo.motorista.nome}</span>
              {onVerMotorista && (
                <button className="btn-link" onClick={onVerMotorista} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left' }}>
                  Ver perfil
                </button>
              )}
            </span>
          }
        />
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
      onStartEdit={iniciarEdicao}
      onCancelEdit={cancelarEdicao}
      onSave={salvarEdicao}
      hasChanges={hasChanges}
      editableFields={editableFields}
      readonlyFields={readonlyFields}
    />
  );
};
