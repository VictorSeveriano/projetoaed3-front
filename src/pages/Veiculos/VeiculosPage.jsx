import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import ModalErro from '../../components/ui/ModalErro';
import veiculosService from '../../services/veiculos.service';
import motoristasService from '../../services/motoristas.service';
import { STATUS_LABELS } from '../../utils/formatters';
import { Car, CarFront, IdCard, CheckCircle2, Search, Filter } from 'lucide-react';
import { ModalPerfilVeiculo, ModalPerfilMotorista } from '../../components/ui/ModaisPerfil';

/** Opções de porte — únicas permitidas pelo sistema */
const PORTES = [
  { value: '',        label: 'Todos'   },
  { value: 'Pequeno', label: 'Pequeno' },
  { value: 'Medio',   label: 'Médio'   },
  { value: 'Grande',  label: 'Grande'  },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'INDISPONIVEL', label: 'Indisponível' },
  { value: 'EM_CORRIDA', label: 'Em corrida' },
  { value: 'PENDENTE', label: 'Pendente' },
];

const CLASSE_OPTIONS = [
  { value: '', label: 'Todas as classes' },
  { value: 'BASICO', label: 'Básico' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'PREMIUM', label: 'Premium' },
];

const PORTE_LABELS = { Pequeno: 'Pequeno', Medio: 'Médio', Grande: 'Grande' };
const CLASSE_LABELS = { BASICO: 'Básico', NORMAL: 'Normal', PREMIUM: 'Premium' };

const CarroCard = ({ carro, onVisualizar }) => {
  const statusInfo = STATUS_LABELS[carro.status] || { label: carro.status, color: 'muted' };
  return (
    <div className="carro-card animate-fade-in">
      <div className="carro-card__header">
        <div className="carro-card__icon"><CarFront size={24} aria-hidden="true" /></div>
        <Badge label={statusInfo.label} color={statusInfo.color} />
      </div>
      <div className="carro-card__body">
        <h3 className="carro-card__name">{carro.marca} {carro.modelo}</h3>
        <p className="carro-card__year">{carro.ano}</p>
        <div className="carro-card__details">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IdCard size={16} /> {carro.placa}</span>
        </div>
        {carro.porte && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Porte: <strong>{PORTE_LABELS[carro.porte] || carro.porte}</strong>
          </p>
        )}
        {carro.classe && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Classe: <strong>{CLASSE_LABELS[carro.classe] || carro.classe}</strong>
          </p>
        )}
      </div>
      <div className="carro-card__footer">
        <Button size="sm" variant="outline" onClick={() => onVisualizar(carro)} style={{ width: '100%' }}>
          <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
          Visualizar
        </Button>
      </div>
    </div>
  );
};

const VeiculosPage = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [porte, setPorte]       = useState('');
  const [status, setStatus]     = useState('');
  const [classe, setClasse]     = useState('');
  const [search, setSearch]     = useState('');
  const [erroModal, setErroModal] = useState({ aberto: false, mensagem: '' });

  // Modal veículo
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const [modalVeiculoOpen, setModalVeiculoOpen]     = useState(false);

  // Modal motorista (acessado a partir do veículo)
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [modalMotoOpen, setModalMotoOpen]               = useState(false);

  const carregar = async (porteFiltro = porte, statusFiltro = status, classeFiltro = classe, searchFiltro = search) => {
    setLoading(true);
    try {
      const filtros = {};
      if (porteFiltro) filtros.porte = porteFiltro;
      if (statusFiltro) filtros.status = statusFiltro;
      if (classeFiltro) filtros.classe = classeFiltro;
      if (searchFiltro.trim()) filtros.search = searchFiltro.trim();
      const res = await veiculosService.listarTodos(filtros);
      setVeiculos(res || []);
    } catch { setVeiculos([]); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => carregar(), 250);
    return () => clearTimeout(timer);
  }, [porte, status, classe, search]);

  const handleVisualizar = (carro) => {
    setVeiculoSelecionado(carro);
    setModalVeiculoOpen(true);
  };

  const limparFiltros = () => {
    setPorte('');
    setStatus('');
    setClasse('');
    setSearch('');
  };

  const handleSalvarVeiculo = async (id, dados) => {
    try {
      await veiculosService.atualizar(id, { ...dados, ano: parseInt(dados.ano, 10) });
      setModalVeiculoOpen(false);
      setVeiculoSelecionado(null);
      carregar();
    } catch (err) {
      setErroModal({
        aberto: true,
        mensagem: err?.response?.data?.message || 'Erro ao salvar veículo.',
      });
    }
  };

  const handleVerMotorista = async () => {
    if (!veiculoSelecionado?.motorista) return;
    try {
      const moto = await motoristasService.buscarPorUsuarioId(veiculoSelecionado.motorista.id || veiculoSelecionado.motoristaId);
      setMotoristaSelecionado(moto);
      setModalVeiculoOpen(false);
      setModalMotoOpen(true);
    } catch { /* silencioso */ }
  };

  return (
    <div className="page animate-fade-in">
      <Header title="Veículos" subtitle="Frota disponível para alocação em corridas" />

      <div className="filters-bar" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <div className="input-group" style={{ marginBottom: 0, minWidth: '260px', flex: '1 1 260px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nome, marca, modelo ou placa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px', marginBottom: 0 }}
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 0, minWidth: '180px' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <select
              id="filtro-status"
              className="input-field input-field--select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ paddingLeft: '40px', marginBottom: 0 }}
            >
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 0, minWidth: '180px' }}>
          <select
            id="filtro-classe"
            className="input-field input-field--select"
            value={classe}
            onChange={(e) => setClasse(e.target.value)}
            style={{ marginBottom: 0 }}
          >
            {CLASSE_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="input-group" style={{ marginBottom: 0, minWidth: '180px' }}>
          <select
            id="filtro-porte"
            className="input-field input-field--select"
            value={porte}
            onChange={(e) => setPorte(e.target.value)}
            style={{ marginBottom: 0 }}
          >
            {PORTES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <Button variant="ghost" onClick={limparFiltros} size="sm">
          Limpar
        </Button>
      </div>

      {loading ? (
        <Loading message="Carregando veículos..." />
      ) : veiculos.length === 0 ? (
        <EmptyState icon={<Car size={48} />} title="Nenhum veículo encontrado" description="Tente ajustar os filtros." />
      ) : (
        <div className="carros-grid">
          {veiculos.map((c) => <CarroCard key={c.id} carro={c} onVisualizar={handleVisualizar} />)}
        </div>
      )}

      {/* Modal de visualização/edição do veículo */}
      <ModalPerfilVeiculo
        isOpen={modalVeiculoOpen}
        onClose={() => { setModalVeiculoOpen(false); setVeiculoSelecionado(null); }}
        veiculo={veiculoSelecionado}
        isAdmin={true}
        onSave={handleSalvarVeiculo}
        onVerMotorista={veiculoSelecionado?.motorista ? handleVerMotorista : null}
      />

      {/* Modal do motorista vinculado */}
      <ModalPerfilMotorista
        isOpen={modalMotoOpen}
        onClose={() => { setModalMotoOpen(false); setMotoristaSelecionado(null); setModalVeiculoOpen(true); }}
        motorista={motoristaSelecionado}
        isAdmin={true}
        onSave={null}
      />

      <ModalErro
        isOpen={erroModal.aberto}
        onClose={() => setErroModal({ aberto: false, mensagem: '' })}
        titulo="Erro"
        mensagem={erroModal.mensagem}
      />
    </div>
  );
};

export default VeiculosPage;
