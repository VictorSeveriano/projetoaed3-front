import React from 'react';
import { Car, Tag, Hash, Calendar, DollarSign, Trash2 } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';
import { STATUS_LABELS, formatarMoeda } from '../../utils/formatters';

export const VeiculoCardEdicao = ({
  veiculo, form, setForm, isEditing, setIsEditing,
  handleCancelClick, handleSaveEdits, handleDelete, deleting,
}) => {
  const statusInfo = STATUS_LABELS[veiculo.status] || { label: veiculo.status, color: 'muted' };
  const classeExibida = veiculo.classe || veiculo.categoria;

  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card-section-title">Dados do veículo</h2>
        {isEditing ? (
          <div className="btn-group">
            <Button type="button" size="sm" variant="outline" onClick={handleCancelClick}>Cancelar</Button>
            <Button type="button" size="sm" variant="success" onClick={handleSaveEdits}>Salvar Alterações</Button>
          </div>
        ) : (
          <div className="btn-group">
            <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={handleDelete}
              disabled={veiculo.status === 'EM_CORRIDA' || deleting}
              title={veiculo.status === 'EM_CORRIDA' ? 'Veículo em corrida' : 'Excluir veículo'}
            >
              <Trash2 size={14} aria-hidden="true" />
              Excluir Veículo
            </Button>
          </div>
        )}
      </div>

      <div className="card__body perfil-stack">
        <div className="perfil-grid">
          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Car size={17} /></span>
            <div className="perfil-campo__body">
              <span className="perfil-campo__label">Modelo / Marca</span>
              <div className="perfil-campo__valor">
                {isEditing ? (
                  <div className="perfil-inline-row">
                    <input
                      type="text"
                      aria-label="Marca do veículo"
                      className="input-field input-field--compact"
                      placeholder="Marca"
                      value={form.marca}
                      onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    />
                    <input
                      type="text"
                      aria-label="Modelo do veículo"
                      className="input-field input-field--compact"
                      placeholder="Modelo"
                      value={form.modelo}
                      onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                    />
                  </div>
                ) : (
                  <span>{veiculo.marca} {veiculo.modelo}</span>
                )}
              </div>
            </div>
          </div>

          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Tag size={17} /></span>
            <div className="perfil-campo__body">
              <span className="perfil-campo__label">Placa</span>
              <div className="perfil-campo__valor tabular-nums">
                {isEditing ? (
                  <input
                    type="text"
                    aria-label="Placa do veículo"
                    className="input-field input-field--compact"
                    value={form.placa}
                    onChange={(e) => setForm({ ...form, placa: e.target.value })}
                  />
                ) : veiculo.placa}
              </div>
            </div>
          </div>

          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Calendar size={17} /></span>
            <div className="perfil-campo__body">
              <span className="perfil-campo__label">Ano</span>
              <div className="perfil-campo__valor tabular-nums">
                {isEditing ? (
                  <input
                    type="number"
                    aria-label="Ano do veículo"
                    className="input-field input-field--compact"
                    value={form.ano}
                    onChange={(e) => setForm({ ...form, ano: e.target.value })}
                  />
                ) : veiculo.ano}
              </div>
            </div>
          </div>

          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Hash size={17} /></span>
            <div className="perfil-campo__body">
              <span className="perfil-campo__label">Porte</span>
              <div className="perfil-campo__valor">
                <span>{veiculo.porte === 'Medio' ? 'Médio' : veiculo.porte}</span>
                {isEditing && (
                  <small className="input-hint">Somente o administrador pode alterar o porte</small>
                )}
              </div>
            </div>
          </div>

          <div className="perfil-campo">
            <span className="perfil-campo__icon" aria-hidden="true"><Hash size={17} /></span>
            <div className="perfil-campo__body">
              <span className="perfil-campo__label">Cor / Km / Passageiros</span>
              <div className="perfil-campo__valor">
                {isEditing ? (
                  <div className="perfil-inline-row">
                    <input
                      type="text"
                      aria-label="Cor do veículo"
                      className="input-field input-field--compact"
                      placeholder="Cor"
                      value={form.cor}
                      onChange={(e) => setForm({ ...form, cor: e.target.value })}
                    />
                    <input
                      type="number"
                      aria-label="Quilometragem"
                      className="input-field input-field--compact"
                      placeholder="Km"
                      value={form.quilometragem}
                      onChange={(e) => setForm({ ...form, quilometragem: e.target.value })}
                    />
                    <input
                      type="number"
                      aria-label="Quantidade de passageiros"
                      className="input-field input-field--compact"
                      placeholder="Passag."
                      value={form.quantidadePassageiros}
                      onChange={(e) => setForm({ ...form, quantidadePassageiros: e.target.value })}
                    />
                  </div>
                ) : (
                  <span className="tabular-nums">
                    {veiculo.cor || '—'} • {veiculo.quilometragem || 0} km • {veiculo.quantidadePassageiros || 4} pass.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="perfil-campo perfil-campo--full">
            <span className="perfil-campo__icon" aria-hidden="true"><Tag size={17} /></span>
            <div className="perfil-campo__body">
              <span className="perfil-campo__label">Itens Adicionais e Documentação</span>
              <div className="perfil-campo__valor">
                {isEditing ? (
                  <div className="veiculo-checklist">
                    <label className="checkbox-field">
                      <input type="checkbox" checked={form.possuiArCondicionado} onChange={(e) => setForm({ ...form, possuiArCondicionado: e.target.checked })} />
                      Ar-Condicionado
                    </label>
                    <label className="checkbox-field">
                      <input type="checkbox" checked={form.possuiExtintor} onChange={(e) => setForm({ ...form, possuiExtintor: e.target.checked })} />
                      Extintor
                    </label>
                    <label className="checkbox-field">
                      <input type="checkbox" checked={form.possuiCintoSeguranca} onChange={(e) => setForm({ ...form, possuiCintoSeguranca: e.target.checked })} />
                      Cinto de Segurança
                    </label>
                    <label className="checkbox-field">
                      <input type="checkbox" checked={form.documentacaoRegularizada} onChange={(e) => setForm({ ...form, documentacaoRegularizada: e.target.checked })} />
                      Documentação Regular
                    </label>
                  </div>
                ) : (
                  <div className="veiculo-badges">
                    <Badge label={veiculo.possuiArCondicionado ? 'Ar-Condicionado' : 'Sem Ar'} color={veiculo.possuiArCondicionado ? 'success' : 'muted'} />
                    <Badge label={veiculo.possuiExtintor ? 'Extintor OK' : 'Sem Extintor'} color={veiculo.possuiExtintor ? 'success' : 'muted'} />
                    <Badge label={veiculo.possuiCintoSeguranca ? 'Cintos OK' : 'Sem Cintos'} color={veiculo.possuiCintoSeguranca ? 'success' : 'muted'} />
                    <Badge label={veiculo.documentacaoRegularizada ? 'Doc Regular' : 'Doc Pendente'} color={veiculo.documentacaoRegularizada ? 'success' : 'danger'} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="perfil-section">
          <h3 className="perfil-section__title perfil-section__title--muted">Status e Tarifas</h3>
          <div className="perfil-grid">
            <div className="perfil-campo">
              <span className="perfil-campo__label">Status da Análise</span>
              <div className="perfil-campo__valor">
                <Badge
                  label={veiculo.statusAprovacao === 'APROVADO' ? 'Aprovado' : veiculo.statusAprovacao === 'REJEITADO' ? 'Rejeitado' : 'Pendente'}
                  color={veiculo.statusAprovacao === 'APROVADO' ? 'success' : veiculo.statusAprovacao === 'REJEITADO' ? 'danger' : 'warning'}
                  dot
                />
              </div>
            </div>

            <div className="perfil-campo">
              <span className="perfil-campo__label">Status de Uso</span>
              <div className="perfil-campo__valor">
                <Badge label={statusInfo.label} color={statusInfo.color} dot />
              </div>
            </div>

            <div className="perfil-campo">
              <span className="perfil-campo__label">Classe Designada</span>
              <div className="perfil-campo__valor">
                <Badge label={classeExibida || 'Não avaliado'} color={classeExibida ? 'primary' : 'muted'} />
              </div>
            </div>

            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><DollarSign size={17} /></span>
              <div className="perfil-campo__body">
                <span className="perfil-campo__label">Tarifa Base Atual (Por Km)</span>
                <span className="perfil-campo__valor perfil-campo__valor--highlight">
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
