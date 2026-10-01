import React from 'react';
import { Car, Tag, Hash, Calendar, DollarSign } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';
import { STATUS_LABELS, formatarMoeda } from '../../utils/formatters';

export const VeiculoCardEdicao = ({ veiculo, form, setForm, isEditing, setIsEditing, handleCancelClick, handleSaveEdits }) => {
  const statusInfo = STATUS_LABELS[veiculo.status] || { label: veiculo.status, color: 'muted' };

  return (
    <div className="card">
      <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="card-section-title">Dados do veículo</h2>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="success" onClick={handleSaveEdits}>Salvar Alterações</Button>
            <Button size="sm" variant="outline" onClick={handleCancelClick}>Cancelar</Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
        )}
      </div>
      <div className="card__body">
        <div className="perfil-grid">
          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Car size={18} /></span>
            <div>
              <span className="perfil-campo__label">Modelo / Marca</span>
              <span className="perfil-campo__valor" style={{ display: 'flex', gap: '8px' }}>
                {isEditing ? (
                  <>
                    <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '50%' }} placeholder="Marca" value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} />
                    <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '50%' }} placeholder="Modelo" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} />
                  </>
                ) : (
                  <span>{veiculo.marca} {veiculo.modelo}</span>
                )}
              </span>
            </div>
          </div>
          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Tag size={18} /></span>
            <div>
              <span className="perfil-campo__label">Placa</span>
              <span className="perfil-campo__valor">
                {isEditing ? (
                  <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} />
                ) : veiculo.placa}
              </span>
            </div>
          </div>
          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Calendar size={18} /></span>
            <div>
              <span className="perfil-campo__label">Ano</span>
              <span className="perfil-campo__valor">
                {isEditing ? (
                  <input type="number" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={form.ano} onChange={e => setForm({ ...form, ano: e.target.value })} />
                ) : veiculo.ano}
              </span>
            </div>
          </div>
          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Hash size={18} /></span>
            <div>
              <span className="perfil-campo__label">Porte</span>
              <span className="perfil-campo__valor">
                {isEditing ? (
                  <select className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={form.porte} onChange={e => setForm({ ...form, porte: e.target.value })}>
                    <option value="Pequeno">Pequeno</option>
                    <option value="Medio">Médio</option>
                    <option value="Grande">Grande</option>
                  </select>
                ) : veiculo.porte}
              </span>
            </div>
          </div>
          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Hash size={18} /></span>
            <div>
              <span className="perfil-campo__label">Cor / Km / Passageiros</span>
              <span className="perfil-campo__valor">
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '33%' }} placeholder="Cor" value={form.cor} onChange={e => setForm({ ...form, cor: e.target.value })} />
                    <input type="number" className="input-field" style={{ padding: '4px', height: 'auto', width: '33%' }} placeholder="Km" value={form.quilometragem} onChange={e => setForm({ ...form, quilometragem: e.target.value })} />
                    <input type="number" className="input-field" style={{ padding: '4px', height: 'auto', width: '33%' }} placeholder="Passag." value={form.quantidadePassageiros} onChange={e => setForm({ ...form, quantidadePassageiros: e.target.value })} />
                  </div>
                ) : (
                  <span>{veiculo.cor || '—'} • {veiculo.quilometragem || 0} km • {veiculo.quantidadePassageiros || 4} pass.</span>
                )}
              </span>
            </div>
          </div>
          <div className="perfil-campo" style={{ gridColumn: '1 / -1' }}>
            <span className="perfil-campo__icon" aria-hidden="true"><Tag size={18} /></span>
            <div style={{ width: '100%' }}>
              <span className="perfil-campo__label">Itens Adicionais e Documentação</span>
              <span className="perfil-campo__valor" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {isEditing ? (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '16px' }}><input type="checkbox" checked={form.possuiArCondicionado} onChange={e => setForm({ ...form, possuiArCondicionado: e.target.checked })} /> Ar-Condicionado</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '16px' }}><input type="checkbox" checked={form.possuiExtintor} onChange={e => setForm({ ...form, possuiExtintor: e.target.checked })} /> Extintor</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '16px' }}><input type="checkbox" checked={form.possuiCintoSeguranca} onChange={e => setForm({ ...form, possuiCintoSeguranca: e.target.checked })} /> Cinto Seg.</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" checked={form.documentacaoRegularizada} onChange={e => setForm({ ...form, documentacaoRegularizada: e.target.checked })} /> Doc. Regular</label>
                  </>
                ) : (
                  <>
                    <Badge label={veiculo.possuiArCondicionado ? 'Ar-Condicionado' : 'Sem Ar'} color={veiculo.possuiArCondicionado ? 'success' : 'muted'} />
                    <Badge label={veiculo.possuiExtintor ? 'Extintor OK' : 'Sem Extintor'} color={veiculo.possuiExtintor ? 'success' : 'muted'} />
                    <Badge label={veiculo.possuiCintoSeguranca ? 'Cintos OK' : 'Sem Cintos'} color={veiculo.possuiCintoSeguranca ? 'success' : 'muted'} />
                    <Badge label={veiculo.documentacaoRegularizada ? 'Doc Regular' : 'Doc Pendente'} color={veiculo.documentacaoRegularizada ? 'success' : 'danger'} />
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Status e Tarifas</h3>
          <div className="perfil-grid">
            <div className="perfil-campo">
              <span className="perfil-campo__label">Status da Análise</span>
              <div><Badge label={veiculo.statusAprovacao === 'APROVADO' ? 'Aprovado' : veiculo.statusAprovacao === 'REJEITADO' ? 'Rejeitado' : 'Pendente'} color={veiculo.statusAprovacao === 'APROVADO' ? 'success' : veiculo.statusAprovacao === 'REJEITADO' ? 'danger' : 'warning'} /></div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__label">Status de Uso</span>
              <div><Badge label={statusInfo.label} color={statusInfo.color} /></div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__label">Classe Designada</span>
              <div><Badge label={veiculo.categoria || 'Não avaliado'} color={veiculo.categoria ? 'primary' : 'muted'} /></div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><DollarSign size={18} /></span>
              <div>
                <span className="perfil-campo__label">Tarifa Base Atual (Por Km)</span>
                <span className="perfil-campo__valor" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {veiculo.tarifaBase ? formatarMoeda(veiculo.tarifaBase) : 'A definir'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
