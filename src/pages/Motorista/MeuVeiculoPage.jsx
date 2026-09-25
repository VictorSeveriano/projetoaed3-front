import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import motoistasService from '../../services/motoristas.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABELS, formatarMoeda } from '../../utils/formatters';
import { Car, Tag, Hash, Calendar, DollarSign } from 'lucide-react';
import api from '../../services/api';

/**
 * MeuVeiculoPage — Veículo associado ao motorista autenticado.
 *
 * Tela separada (não incorporada ao perfil) porque o veículo possui
 * status, categoria e tarifaBase além do que cabe no perfil confortavelmente.
 * Decisão documentada: seção 4 do documento de requisitos.
 */
const MeuVeiculoPage = () => {
  const { usuario } = useAuth();
  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  
  const [form, setForm] = useState({ 
    modelo: '', marca: '', ano: '', placa: '', porte: 'PEQUENO', cor: '', quilometragem: '', quantidadePassageiros: 4,
    possuiArCondicionado: false, possuiExtintor: false, possuiCintoSeguranca: false, documentacaoRegularizada: false
  });
  const [submitting, setSubmitting] = useState(false);

  const carregar = () => {
    setLoading(true);
    motoistasService.buscarVeiculo(usuario.id)
      .then((dados) => setVeiculo(dados))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar veículo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (usuario?.id) carregar();
  }, [usuario?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.modelo || !form.marca || !form.ano || !form.placa) {
      setError('Preencha todos os campos.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/veiculos', { ...form, ano: parseInt(form.ano, 10), usuarioId: usuario.id });
      carregar();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar veículo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Carregando veículo..." />;

  if (error) {
    return (
      <div className="page animate-fade-in">
        <Header title="Meu Veículo" subtitle="Veículo associado à sua conta" />
        <div className="form-error" role="alert">{error}</div>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="page animate-fade-in">
        <Header title="Meu Veículo" subtitle="Cadastre seu veículo para realizar corridas" />
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
                  <option value="PEQUENO">Pequeno (Hatch)</option>
                  <option value="MEDIO">Médio (Sedan)</option>
                  <option value="GRANDE">Grande (Minivan)</option>
                  <option value="SUV">SUV</option>
                  <option value="LUXO">Luxo</option>
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
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[veiculo.status] || { label: veiculo.status, color: 'muted' };

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Veículo" subtitle="Informações do veículo vinculado à sua conta" />

      <div className="card">
        <div className="card__header">
          <h2 className="card-section-title">Dados do veículo</h2>
        </div>
        <div className="card__body">
          <div className="perfil-grid">
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Car size={18} /></span>
              <div>
                <span className="perfil-campo__label">Modelo</span>
                <span className="perfil-campo__valor">{veiculo.marca} {veiculo.modelo}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Calendar size={18} /></span>
              <div>
                <span className="perfil-campo__label">Ano</span>
                <span className="perfil-campo__valor">{veiculo.ano}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Hash size={18} /></span>
              <div>
                <span className="perfil-campo__label">Placa</span>
                <span className="perfil-campo__valor">{veiculo.placa}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Tag size={18} /></span>
              <div>
                <span className="perfil-campo__label">Porte / Tipo</span>
                <span className="perfil-campo__valor">{veiculo.porte || '—'} / <Badge label={veiculo.tipo || 'NORMAL'} color={veiculo.tipo === 'PREMIUM' ? 'warning' : 'info'} /></span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><DollarSign size={18} /></span>
              <div>
                <span className="perfil-campo__label">Tarifa base</span>
                <span className="perfil-campo__valor">{formatarMoeda(veiculo.tarifaBase)}/km</span>
              </div>
            </div>
            <div className="perfil-campo">
              <span className="perfil-campo__icon" aria-hidden="true"><Car size={18} /></span>
              <div>
                <span className="perfil-campo__label">Status</span>
                <Badge label={statusInfo.label} color={statusInfo.color} />
              </div>
            </div>
          </div>
          
          <hr style={{ margin: '24px 0', borderColor: 'var(--color-border)' }} />
          
          <div className="perfil-grid">
            <div className="perfil-campo">
              <div>
                <span className="perfil-campo__label">Cor</span>
                <span className="perfil-campo__valor">{veiculo.cor || '—'}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <div>
                <span className="perfil-campo__label">Quilometragem</span>
                <span className="perfil-campo__valor">{veiculo.quilometragem ? `${veiculo.quilometragem} km` : '—'}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <div>
                <span className="perfil-campo__label">Passageiros</span>
                <span className="perfil-campo__valor">{veiculo.quantidadePassageiros || '—'}</span>
              </div>
            </div>
            <div className="perfil-campo">
              <div>
                <span className="perfil-campo__label">Itens de Segurança</span>
                <span className="perfil-campo__valor" style={{ display: 'block', marginTop: '4px' }}>
                  • Ar-Condicionado: {veiculo.possuiArCondicionado ? 'Sim' : 'Não'}<br/>
                  • Extintor: {veiculo.possuiExtintor ? 'Sim' : 'Não'}<br/>
                  • Cinto Segurança: {veiculo.possuiCintoSeguranca ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
            <div className="perfil-campo">
              <div>
                <span className="perfil-campo__label">Documentação</span>
                <span className="perfil-campo__valor">{veiculo.documentacaoRegularizada ? 'Regularizada' : 'Pendente/Irregular'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuVeiculoPage;
