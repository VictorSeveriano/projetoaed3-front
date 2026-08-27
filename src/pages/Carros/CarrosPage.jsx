import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import carrosService from '../../services/carros.service';
import reservasService from '../../services/reservas.service';
import localizacoesService from '../../services/localizacoes.service';
import grafoService from '../../services/grafo.service';
import { formatarMoeda, STATUS_LABELS } from '../../utils/formatters';
import { isEndAfterStart } from '../../utils/validators';

const CATEGORIAS = ['Todos', 'Sedan', 'Hatch', 'SUV'];

const CarroCard = ({ carro, onReservar }) => {
  const statusInfo = STATUS_LABELS[carro.status] || { label: carro.status, color: 'muted' };
  return (
    <div className="carro-card animate-fade-in">
      <div className="carro-card__header">
        <div className="carro-card__icon">🚗</div>
        <Badge label={statusInfo.label} color={statusInfo.color} />
      </div>
      <div className="carro-card__body">
        <h3 className="carro-card__name">{carro.marca} {carro.modelo}</h3>
        <p className="carro-card__year">{carro.ano} · {carro.categoria}</p>
        <div className="carro-card__details">
          <span>📍 {carro.localizacao}</span>
          <span>🪪 {carro.placa}</span>
        </div>
        <p className="carro-card__price">{formatarMoeda(carro.precoDiaria)}<span>/dia</span></p>
      </div>
      <div className="carro-card__footer">
        <Button
          id={`btn-reservar-${carro.id}`}
          onClick={() => onReservar(carro)}
          disabled={carro.status !== 'DISPONIVEL'}
          size="sm"
          className="w-full"
        >
          {carro.status === 'DISPONIVEL' ? '📝 Reservar' : '🔒 Indisponivel'}
        </Button>
      </div>
    </div>
  );
};

const CarrosPage = () => {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ categoria: '', localizacao: '' });
  const [localizacoes, setLocalizacoes] = useState([]);
  const [reservaModal, setReservaModal] = useState({ open: false, carro: null });
  const [form, setForm] = useState({ dataInicio: '', dataFim: '', localRetirada: '', localDevolucao: '' });
  const [rota, setRota] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const carregarCarros = async () => {
    setLoading(true);
    try {
      const res = await carrosService.listarTodos(filtros);
      setCarros(res.data || []);
    } catch { setCarros([]); } finally { setLoading(false); }
  };

  useEffect(() => { carregarCarros(); }, [filtros]);

  useEffect(() => {
    localizacoesService.listarTodas().then((r) => setLocalizacoes(r.data || [])).catch(() => {});
  }, []);

  const abrirReserva = (carro) => {
    setReservaModal({ open: true, carro });
    setForm({ dataInicio: '', dataFim: '', localRetirada: carro.localizacao, localDevolucao: '' });
    setRota(null); setFormError(''); setSuccessMsg('');
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setRota(null); setFormError('');
  };

  const calcularRota = async () => {
    if (!form.localRetirada || !form.localDevolucao) { setFormError('Informe os locais de retirada e devolucao.'); return; }
    if (form.localRetirada === form.localDevolucao) { setRota({ caminho: [form.localRetirada], distanciaTotal: 0 }); return; }
    try {
      const res = await grafoService.calcularRota(form.localRetirada, form.localDevolucao);
      setRota(res.data);
    } catch { setFormError('Nao foi possivel calcular a rota entre os pontos selecionados.'); }
  };

  const confirmarReserva = async () => {
    setFormError('');
    if (!form.dataInicio || !form.dataFim || !form.localRetirada || !form.localDevolucao) {
      setFormError('Preencha todos os campos.'); return;
    }
    if (!isEndAfterStart(form.dataInicio, form.dataFim)) {
      setFormError('A data de fim deve ser posterior a data de inicio.'); return;
    }
    setFormLoading(true);
    try {
      await reservasService.criar({
        usuarioId: '1',
        carroId: reservaModal.carro.id,
        ...form,
      });
      setSuccessMsg('Reserva criada com sucesso! 🎉');
      carregarCarros();
      setTimeout(() => { setReservaModal({ open: false, carro: null }); setSuccessMsg(''); }, 1800);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao criar reserva.');
    } finally { setFormLoading(false); }
  };

  return (
    <div className="page animate-fade-in">
      <Header title="Carros" subtitle="Gerencie e reserve os veículos disponíveis" />

      {/* Filtros */}
      <div className="filters-bar">
        <select
          id="filtro-categoria"
          className="input-field input-field--select filters-bar__select"
          value={filtros.categoria}
          onChange={(e) => setFiltros((p) => ({ ...p, categoria: e.target.value === 'Todos' ? '' : e.target.value }))}
        >
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          id="filtro-localizacao"
          className="input-field input-field--select filters-bar__select"
          value={filtros.localizacao}
          onChange={(e) => setFiltros((p) => ({ ...p, localizacao: e.target.value }))}
        >
          <option value="">Todas as Localizações</option>
          {localizacoes.map((l) => <option key={l.id} value={l.nome}>{l.nome}</option>)}
        </select>
        <Button variant="ghost" onClick={() => setFiltros({ categoria: '', localizacao: '' })} size="sm">
          Limpar
        </Button>
      </div>

      {loading ? (
        <Loading message="Carregando carros..." />
      ) : carros.length === 0 ? (
        <EmptyState icon="🚗" title="Nenhum carro encontrado" description="Tente ajustar os filtros." />
      ) : (
        <div className="carros-grid">
          {carros.map((c) => <CarroCard key={c.id} carro={c} onReservar={abrirReserva} />)}
        </div>
      )}

      {/* Modal de Reserva */}
      <Modal
        isOpen={reservaModal.open}
        onClose={() => setReservaModal({ open: false, carro: null })}
        title={`Reservar: ${reservaModal.carro?.marca} ${reservaModal.carro?.modelo}`}
        size="lg"
      >
        {successMsg ? (
          <div className="success-banner">{successMsg}</div>
        ) : (
          <div className="reserva-form">
            <div className="reserva-form__row">
              <Input id="dataInicio" name="dataInicio" label="Data Início" type="date" value={form.dataInicio} onChange={handleFormChange} />
              <Input id="dataFim"    name="dataFim"    label="Data Fim"   type="date" value={form.dataFim}    onChange={handleFormChange} />
            </div>
            <div className="reserva-form__row">
              <Select id="localRetirada"   name="localRetirada"   label="Local de Retirada"   value={form.localRetirada}   onChange={handleFormChange}>
                <option value="">Selecione...</option>
                {localizacoes.map((l) => <option key={l.id} value={l.nome}>{l.nome}</option>)}
              </Select>
              <Select id="localDevolucao"  name="localDevolucao"  label="Local de Devolução"  value={form.localDevolucao}  onChange={handleFormChange}>
                <option value="">Selecione...</option>
                {localizacoes.map((l) => <option key={l.id} value={l.nome}>{l.nome}</option>)}
              </Select>
            </div>

            <Button id="btn-calcular-rota" variant="secondary" onClick={calcularRota} size="sm">
              🗺️ Calcular Rota (Dijkstra)
            </Button>

            {rota && (
              <div className="rota-preview">
                <p className="rota-preview__title">Menor Caminho Encontrado</p>
                <p className="rota-preview__path">{rota.caminho?.join(' → ')}</p>
                <p className="rota-preview__distance">Distância Total: <strong>{rota.distanciaTotal} km</strong></p>
              </div>
            )}

            {formError && <div className="form-error" role="alert">⚠️ {formError}</div>}

            <div className="reserva-form__actions">
              <Button variant="ghost" onClick={() => setReservaModal({ open: false, carro: null })}>Cancelar</Button>
              <Button id="btn-confirmar-reserva" onClick={confirmarReserva} loading={formLoading}>✅ Confirmar Reserva</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CarrosPage;
