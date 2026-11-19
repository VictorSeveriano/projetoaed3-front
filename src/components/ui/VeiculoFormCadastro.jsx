import React from 'react';
import Button from './Button';

export const VeiculoFormCadastro = ({ form, setForm, handleSubmit, submitting }) => {
  return (
    <div className="card form-card-centered">
      <div className="card__header">
        <h2 className="card-section-title">Cadastrar Veículo</h2>
      </div>
      <div className="card__body">
        <form onSubmit={handleSubmit} className="wizard-form">
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="veic-marca">
                Marca <span className="input-required" aria-hidden="true">*</span>
              </label>
              <input
                id="veic-marca"
                type="text"
                className="input-field"
                placeholder="Ex: Toyota"
                required
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="veic-modelo">
                Modelo <span className="input-required" aria-hidden="true">*</span>
              </label>
              <input
                id="veic-modelo"
                type="text"
                className="input-field"
                placeholder="Ex: Corolla"
                required
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="veic-ano">
                Ano <span className="input-required" aria-hidden="true">*</span>
              </label>
              <input
                id="veic-ano"
                type="number"
                className="input-field"
                placeholder="Ex: 2024"
                required
                value={form.ano}
                onChange={(e) => setForm({ ...form, ano: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="veic-placa">
                Placa <span className="input-required" aria-hidden="true">*</span>
              </label>
              <input
                id="veic-placa"
                type="text"
                className="input-field"
                placeholder="Ex: ABC-1234"
                required
                value={form.placa}
                onChange={(e) => setForm({ ...form, placa: e.target.value })}
              />
            </div>

            <div className="input-group form-grid__full">
              <label className="input-label" htmlFor="veic-porte">
                Porte do Veículo <span className="input-required" aria-hidden="true">*</span>
              </label>
              <select
                id="veic-porte"
                className="input-field input-field--select"
                required
                value={form.porte}
                onChange={(e) => setForm({ ...form, porte: e.target.value })}
              >
                <option value="" disabled>Selecione o porte...</option>
                <option value="Pequeno">Pequeno</option>
                <option value="Medio">Médio</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="veic-cor">Cor</label>
              <input
                id="veic-cor"
                type="text"
                className="input-field"
                placeholder="Ex: Prata"
                value={form.cor}
                onChange={(e) => setForm({ ...form, cor: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="veic-km">Quilometragem</label>
              <input
                id="veic-km"
                type="number"
                className="input-field"
                placeholder="Ex: 50000"
                value={form.quilometragem}
                onChange={(e) => setForm({ ...form, quilometragem: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="veic-passageiros">Quantidade de Passageiros</label>
              <input
                id="veic-passageiros"
                type="number"
                className="input-field"
                placeholder="Ex: 4"
                value={form.quantidadePassageiros}
                onChange={(e) => setForm({ ...form, quantidadePassageiros: parseInt(e.target.value, 10) || 4 })}
              />
            </div>

            <div className="input-group form-grid__full">
              <span className="input-label">Itens de Segurança e Documentação</span>
              <div className="veiculo-checklist">
                <label className="checkbox-field">
                  <input type="checkbox" checked={form.possuiArCondicionado} onChange={(e) => setForm({ ...form, possuiArCondicionado: e.target.checked })} />
                  Possui Ar-Condicionado
                </label>
                <label className="checkbox-field">
                  <input type="checkbox" checked={form.possuiExtintor} onChange={(e) => setForm({ ...form, possuiExtintor: e.target.checked })} />
                  Possui Extintor
                </label>
                <label className="checkbox-field">
                  <input type="checkbox" checked={form.possuiCintoSeguranca} onChange={(e) => setForm({ ...form, possuiCintoSeguranca: e.target.checked })} />
                  Possui Cinto de Segurança
                </label>
                <label className="checkbox-field">
                  <input type="checkbox" checked={form.documentacaoRegularizada} onChange={(e) => setForm({ ...form, documentacaoRegularizada: e.target.checked })} />
                  Documentação Regularizada
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
            Cadastrar Veículo
          </Button>
        </form>
      </div>
    </div>
  );
};
