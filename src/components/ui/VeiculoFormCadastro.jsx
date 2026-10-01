import React from 'react';
import { Car } from 'lucide-react';

export const VeiculoFormCadastro = ({ form, setForm, handleSubmit, submitting }) => {
  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>Cadastrar Veículo</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Marca</label>
            <input type="text" className="input-field" placeholder="Ex: Toyota" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Modelo</label>
            <input type="text" className="input-field" placeholder="Ex: Corolla" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Ano</label>
            <input type="number" className="input-field" placeholder="Ex: 2024" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Placa</label>
            <input type="text" className="input-field" placeholder="Ex: ABC-1234" value={form.placa} onChange={e => setForm({...form, placa: e.target.value})} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Porte do Veículo</label>
            <select className="input-field" value={form.porte} onChange={e => setForm({...form, porte: e.target.value})}>
              <option value="Pequeno">Pequeno</option>
              <option value="Medio">Médio</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Cor</label>
            <input type="text" className="input-field" placeholder="Ex: Prata" value={form.cor} onChange={e => setForm({...form, cor: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Quilometragem</label>
            <input type="number" className="input-field" placeholder="Ex: 50000" value={form.quilometragem} onChange={e => setForm({...form, quilometragem: parseInt(e.target.value) || 0})} />
          </div>
          <div className="input-group">
            <label className="input-label">Quantidade de Passageiros</label>
            <input type="number" className="input-field" placeholder="Ex: 4" value={form.quantidadePassageiros} onChange={e => setForm({...form, quantidadePassageiros: parseInt(e.target.value) || 4})} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Itens de Segurança e Documentação</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.possuiArCondicionado} onChange={e => setForm({...form, possuiArCondicionado: e.target.checked})} />
                Possui Ar-Condicionado
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.possuiExtintor} onChange={e => setForm({...form, possuiExtintor: e.target.checked})} />
                Possui Extintor
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.possuiCintoSeguranca} onChange={e => setForm({...form, possuiCintoSeguranca: e.target.checked})} />
                Possui Cinto de Segurança
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.documentacaoRegularizada} onChange={e => setForm({...form, documentacaoRegularizada: e.target.checked})} />
                Documentação Regularizada
              </label>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Cadastrando...' : 'Cadastrar Veículo'}
        </button>
      </form>
    </div>
  );
};
