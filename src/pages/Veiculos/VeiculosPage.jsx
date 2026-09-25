import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import veiculosService from '../../services/veiculos.service';
import { formatarMoeda, STATUS_LABELS } from '../../utils/formatters';
import { Car, CarFront, IdCard, CheckCircle2 } from 'lucide-react';

const CATEGORIAS = ['Todos', 'Sedan', 'Hatch', 'SUV'];

const CarroCard = ({ carro }) => {
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IdCard size={16} /> {carro.placa}</span>
        </div>
        <p className="carro-card__price">{formatarMoeda(carro.tarifaBase)}<span>/km</span></p>
      </div>
      <div className="carro-card__footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} /> 
          Recurso para Corridas
        </div>
      </div>
    </div>
  );
};

const VeiculosPage = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ categoria: '' });

  const carregarCarros = async () => {
    setLoading(true);
    try {
      const res = await veiculosService.listarTodos(filtros);
      setVeiculos(res || []);
    } catch { setVeiculos([]); } finally { setLoading(false); }
  };

  useEffect(() => { carregarCarros(); }, [filtros]);

  return (
    <div className="page animate-fade-in">
      <Header title="Veiculos" subtitle="Frota disponível para alocação em corridas" />

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
        <Button variant="ghost" onClick={() => setFiltros({ categoria: '' })} size="sm">
          Limpar
        </Button>
      </div>

      {loading ? (
        <Loading message="Carregando veículos..." />
      ) : veiculos.length === 0 ? (
        <EmptyState icon={<Car size={48} />} title="Nenhum veículo encontrado" description="Tente ajustar os filtros." />
      ) : (
        <div className="carros-grid">
          {veiculos.map((c) => <CarroCard key={c.id} carro={c} />)}
        </div>
      )}
    </div>
  );
};

export default VeiculosPage;
