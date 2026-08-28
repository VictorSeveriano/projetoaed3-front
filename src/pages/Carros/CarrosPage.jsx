import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ReservaModal from '../../components/ui/ReservaModal';
import Button from '../../components/ui/Button';
import carrosService from '../../services/carros.service';
import localizacoesService from '../../services/localizacoes.service';
import { formatarMoeda, STATUS_LABELS } from '../../utils/formatters';
import { Car, CarFront, MapPin, IdCard, CalendarPlus, Lock } from 'lucide-react';

const CATEGORIAS = ['Todos', 'Sedan', 'Hatch', 'SUV'];

const CarroCard = ({ carro, onReservar }) => {
  const statusInfo = STATUS_LABELS[carro.status] || { label: carro.status, color: 'muted' };
  return (
    <div className="carro-card animate-fade-in">
      <div className="carro-card__header">
        <div className="carro-card__icon"><CarFront size={24} aria-hidden="true" /></div>
        <Badge label={statusInfo.label} color={statusInfo.color} />
      </div>
      <div className="carro-card__body">
        <h3 className="carro-card__name">{carro.marca} {carro.modelo}</h3>
        <p className="carro-card__year">{carro.ano} · {carro.categoria}</p>
        <div className="carro-card__details">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={carro.localizacao}><MapPin size={16} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{carro.localizacao}</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IdCard size={16} /> {carro.placa}</span>
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
          {carro.status === 'DISPONIVEL' ? 
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CalendarPlus size={16} /> Reservar</span> : 
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Lock size={16} /> Indisponivel</span>}
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
        <EmptyState icon={<Car size={48} />} title="Nenhum carro encontrado" description="Tente ajustar os filtros." />
      ) : (
        <div className="carros-grid">
          {carros.map((c) => <CarroCard key={c.id} carro={c} onReservar={abrirReserva} />)}
        </div>
      )}

      {/* Modal de Reserva */}
      <ReservaModal
        isOpen={reservaModal.open}
        onClose={() => setReservaModal({ open: false, carro: null })}
        carro={reservaModal.carro}
        localizacoes={localizacoes}
        onSuccess={carregarCarros}
      />
    </div>
  );
};

export default CarrosPage;
