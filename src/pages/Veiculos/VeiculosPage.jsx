import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import veiculosService from '../../services/veiculos.service';
import motoristasService from '../../services/motoristas.service';
import { STATUS_LABELS } from '../../utils/formatters';
import { Car, CarFront, IdCard, CheckCircle2 } from 'lucide-react';
import { ModalPerfilVeiculo, ModalPerfilMotorista } from '../../components/ui/ModaisPerfil';

/** Opções de porte — únicas permitidas pelo sistema */
const PORTES = [
  { value: '',        label: 'Todos'   },
  { value: 'Pequeno', label: 'Pequeno' },
  { value: 'Medio',   label: 'Médio'   },
  { value: 'Grande',  label: 'Grande'  },
];

const PORTE_LABELS = { Pequeno: 'Pequeno', Medio: 'Médio', Grande: 'Grande' };
const CLASSE_LABELS = { BASICO: 'Básico', NORMAL: 'Normal', PREMIUM: 'Premium' };
const CLASSE_COLORS = { BASICO: 'info', NORMAL: 'info', PREMIUM: 'warning' };

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

  // Modal veículo
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const [modalVeiculoOpen, setModalVeiculoOpen]     = useState(false);

  // Modal motorista (acessado a partir do veículo)
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [modalMotoOpen, setModalMotoOpen]               = useState(false);

  const carregar = async (porteFiltro = porte) => {
    setLoading(true);
    try {
      const filtros = {};
      if (porteFiltro) filtros.porte = porteFiltro;
      const res = await veiculosService.listarTodos(filtros);
      setVeiculos(res || []);
    } catch { setVeiculos([]); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(porte); }, [porte]);

  const handleVisualizar = (carro) => {
    setVeiculoSelecionado(carro);
    setModalVeiculoOpen(true);
  };

  const handleSalvarVeiculo = async (id, dados) => {
    try {
      await veiculosService.atualizar(id, { ...dados, ano: parseInt(dados.ano, 10) });
      setModalVeiculoOpen(false);
      setVeiculoSelecionado(null);
      carregar();
    } catch (err) {
      alert(err?.response?.data?.message || 'Erro ao salvar veículo.');
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

      {/* Filtro por porte */}
      <div className="filters-bar">
        <select
          id="filtro-porte"
          className="input-field input-field--select filters-bar__select"
          value={porte}
          onChange={(e) => setPorte(e.target.value)}
        >
          {PORTES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <Button variant="ghost" onClick={() => setPorte('')} size="sm">
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
    </div>
  );
};

export default VeiculosPage;
