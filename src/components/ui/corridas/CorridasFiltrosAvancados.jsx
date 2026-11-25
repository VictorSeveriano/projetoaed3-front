import React, { useState } from 'react';
import Button from '../Button';
import {
  listarChipsFiltrosAtivos,
  contarFiltrosAtivos,
} from '../../../utils/indicadorAtrasoCorrida';
import {
  SlidersHorizontal,
  Download,
  FileText,
  X,
  ArrowUpDown,
  RotateCcw,
  Search,
} from 'lucide-react';

const OPCOES_ORDENACAO = [
  { valor: 'dataHorario:desc', rotulo: 'Data programada (mais recentes)' },
  { valor: 'dataHorario:asc', rotulo: 'Data programada (mais antigas)' },
  { valor: 'criadaEm:desc', rotulo: 'Solicitação (mais recentes)' },
  { valor: 'valor:desc', rotulo: 'Maior valor' },
  { valor: 'valor:asc', rotulo: 'Menor valor' },
];

/**
 * CorridasFiltrosAvancados — Barra compacta de ordenação, exportação (CSV/PDF) e
 * painel retrátil de filtros combináveis com indicadores de filtros ativos.
 */
const CorridasFiltrosAvancados = ({
  perfil = 'USUARIO',
  filtrosAplicados,
  ordenarPor = 'dataHorario',
  direcao = 'desc',
  exportandoFormato = '',
  erroExportacao = '',
  onAplicarFiltros,
  onRemoverFiltroIndividual,
  onLimparFiltros,
  onAlterarOrdenacao,
  onExportar,
}) => {
  const [expandido, setExpandido] = useState(false);
  const [rascunho, setRascunho] = useState(filtrosAplicados);

  const qtdAtivos = contarFiltrosAtivos(filtrosAplicados);
  const chipsAtivos = listarChipsFiltrosAtivos(filtrosAplicados);

  const ehAdmin = perfil === 'ADMINISTRADOR';
  const ehMotorista = perfil === 'MOTORISTA';
  const ehPassageiro = perfil === 'USUARIO';

  const sincronizarEAbrir = () => {
    if (!expandido) {
      setRascunho(filtrosAplicados);
    }
    setExpandido((v) => !v);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRascunho((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAplicarFiltros(rascunho);
  };

  const handleLimparTudo = () => {
    onLimparFiltros();
    setExpandido(false);
  };

  const handleSelectOrdenacao = (e) => {
    const [campo, dir] = String(e.target.value).split(':');
    onAlterarOrdenacao(campo || 'dataHorario', dir || 'desc');
  };

  return (
    <div className="corridas-toolbar">
      <div className="corridas-toolbar__row">
        <div className="corridas-toolbar__left">
          <Button
            id="btn-toggle-filtros-corridas"
            type="button"
            variant={qtdAtivos > 0 || expandido ? 'primary' : 'outline'}
            size="sm"
            aria-expanded={expandido}
            aria-controls="painel-filtros-avancados-corridas"
            onClick={sincronizarEAbrir}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span>Filtros avançados</span>
            {qtdAtivos > 0 && <span className="corridas-filter-count">{qtdAtivos}</span>}
          </Button>

          {qtdAtivos > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLimparTudo}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="corridas-toolbar__right">
          <div className="corridas-sort-wrap">
            <ArrowUpDown size={14} className="corridas-sort-wrap__icon" aria-hidden="true" />
            <select
              aria-label="Ordenar corridas"
              value={`${ordenarPor}:${direcao}`}
              onChange={handleSelectOrdenacao}
              className="input-field input-field--compact input-field--select corridas-sort-select"
            >
              {OPCOES_ORDENACAO.map((op) => (
                <option key={op.valor} value={op.valor}>
                  {op.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div className="btn-group">
            <Button
              id="btn-exportar-csv"
              type="button"
              variant="outline"
              size="sm"
              loading={exportandoFormato === 'csv'}
              disabled={Boolean(exportandoFormato)}
              onClick={() => onExportar('csv')}
              title="Exportar corridas filtradas em CSV (Excel)"
            >
              <Download size={14} aria-hidden="true" />
              CSV
            </Button>
            <Button
              id="btn-exportar-pdf"
              type="button"
              variant="outline"
              size="sm"
              loading={exportandoFormato === 'pdf'}
              disabled={Boolean(exportandoFormato)}
              onClick={() => onExportar('pdf')}
              title="Exportar relatório em PDF"
            >
              <FileText size={14} aria-hidden="true" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {erroExportacao && (
        <div className="form-error" role="alert" style={{ marginTop: 8 }}>
          <span>{erroExportacao}</span>
        </div>
      )}

      {/* Chips de filtros ativos */}
      {chipsAtivos.length > 0 && (
        <div className="corridas-active-chips" aria-label="Filtros ativos">
          {chipsAtivos.map((chip) => (
            <span key={chip.chave} className="corridas-chip">
              <span>{chip.rotulo}</span>
              <button
                type="button"
                className="corridas-chip__remove"
                aria-label={`Remover filtro ${chip.rotulo}`}
                onClick={() => {
                  const valorVazio = typeof filtrosAplicados[chip.chave] === 'boolean' ? false : '';
                  setRascunho((prev) => ({ ...prev, [chip.chave]: valorVazio }));
                  onRemoverFiltroIndividual(chip.chave);
                }}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Painel retrátil de filtros avançados */}
      {expandido && (
        <form
          id="painel-filtros-avancados-corridas"
          className="corridas-advanced-panel"
          onSubmit={handleSubmit}
        >
          <div className="corridas-advanced-grid">
            <div className="input-group">
              <label htmlFor="filtro-corrida-id" className="input-label">ID da corrida</label>
              <input
                id="filtro-corrida-id"
                type="text"
                name="id"
                value={rascunho.id}
                onChange={handleChange}
                placeholder="Ex.: #a1b2c3 ou UUID"
                className="input-field input-field--compact"
              />
            </div>

            <div className="input-group">
              <label htmlFor="filtro-corrida-status" className="input-label">Status</label>
              <select
                id="filtro-corrida-status"
                name="status"
                value={rascunho.status}
                onChange={handleChange}
                className="input-field input-field--compact input-field--select"
              >
                <option value="">Todos os status</option>
                <option value="SOLICITADA">Solicitada</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="filtro-corrida-inicio" className="input-label">Período inicial</label>
              <input
                id="filtro-corrida-inicio"
                type="date"
                name="dataInicio"
                value={rascunho.dataInicio}
                onChange={handleChange}
                className="input-field input-field--compact"
              />
            </div>

            <div className="input-group">
              <label htmlFor="filtro-corrida-fim" className="input-label">Período final</label>
              <input
                id="filtro-corrida-fim"
                type="date"
                name="dataFim"
                value={rascunho.dataFim}
                onChange={handleChange}
                className="input-field input-field--compact"
              />
            </div>

            <div className="input-group">
              <label htmlFor="filtro-corrida-origem" className="input-label">Origem</label>
              <input
                id="filtro-corrida-origem"
                type="text"
                name="origem"
                value={rascunho.origem}
                onChange={handleChange}
                placeholder="Bairro, avenida ou local..."
                className="input-field input-field--compact"
              />
            </div>

            <div className="input-group">
              <label htmlFor="filtro-corrida-destino" className="input-label">Destino</label>
              <input
                id="filtro-corrida-destino"
                type="text"
                name="destino"
                value={rascunho.destino}
                onChange={handleChange}
                placeholder="Bairro, avenida ou local..."
                className="input-field input-field--compact"
              />
            </div>

            {(ehAdmin || ehPassageiro) && (
              <div className="input-group">
                <label htmlFor="filtro-corrida-motorista" className="input-label">Motorista</label>
                <input
                  id="filtro-corrida-motorista"
                  type="text"
                  name="motorista"
                  value={rascunho.motorista}
                  onChange={handleChange}
                  placeholder="Nome ou usuário do motorista"
                  className="input-field input-field--compact"
                />
              </div>
            )}

            {(ehAdmin || ehMotorista) && (
              <div className="input-group">
                <label htmlFor="filtro-corrida-passageiro" className="input-label">Passageiro</label>
                <input
                  id="filtro-corrida-passageiro"
                  type="text"
                  name="passageiro"
                  value={rascunho.passageiro}
                  onChange={handleChange}
                  placeholder="Nome ou usuário do passageiro"
                  className="input-field input-field--compact"
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="filtro-corrida-veiculo" className="input-label">Veículo / Placa</label>
              <input
                id="filtro-corrida-veiculo"
                type="text"
                name="veiculo"
                value={rascunho.veiculo}
                onChange={handleChange}
                placeholder="Modelo, marca ou placa"
                className="input-field input-field--compact"
              />
            </div>

            <div className="input-group">
              <label htmlFor="filtro-corrida-canceladopor" className="input-label">
                Responsável pelo cancelamento
              </label>
              <select
                id="filtro-corrida-canceladopor"
                name="canceladoPor"
                value={rascunho.canceladoPor}
                onChange={handleChange}
                className="input-field input-field--compact input-field--select"
              >
                <option value="">Todos</option>
                <option value="MOTORISTA">Motorista</option>
                <option value="PASSAGEIRO">Passageiro</option>
                <option value="SISTEMA">Sistema / Administração</option>
              </select>
            </div>
          </div>

          <div className="corridas-advanced-checks" role="group" aria-label="Recortes rápidos de situação">
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="atrasadas"
                checked={Boolean(rascunho.atrasadas)}
                onChange={handleChange}
              />
              <span>Corridas em atraso</span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="finalizadas"
                checked={Boolean(rascunho.finalizadas)}
                onChange={handleChange}
              />
              <span>Corridas finalizadas</span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="canceladas"
                checked={Boolean(rascunho.canceladas)}
                onChange={handleChange}
              />
              <span>Corridas canceladas</span>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="expiradas"
                checked={Boolean(rascunho.expiradas)}
                onChange={handleChange}
              />
              <span>Corridas expiradas</span>
            </label>
          </div>

          <div className="corridas-advanced-footer">
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpandido(false)}>
              Recolher
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleLimparTudo}>
              Limpar tudo
            </Button>
            <Button type="submit" variant="primary" size="sm">
              <Search size={14} aria-hidden="true" />
              Aplicar filtros
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CorridasFiltrosAvancados;
