import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import motoistasService from '../../services/motoristas.service';
import api from '../../services/api';
import { formatarMoeda } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Target, CheckCircle, Route, DollarSign } from 'lucide-react';


/**
 * InicioMotoristaPage — Página inicial do motorista.
 *
 * Exibe resumo do mês atual se APROVADO.
 * Se não houver solicitação, exibe form de CNH.
 * Se PENDENTE/REJEITADO, exibe status.
 */
const InicioMotoristaPage = () => {
  const { usuario } = useAuth();
  const hoje = new Date();
  
  const [motoristaPerfil, setMotoristaPerfil] = useState(undefined); // undefined = loading
  const [cnhForm, setCnhForm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [resumo, setResumo] = useState(null);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [error, setError]   = useState('');

  const carregarPerfil = async () => {
    if (!usuario?.id) return;
    try {
      const { data } = await api.get(`/motoristas/perfil/${usuario.id}`);
      setMotoristaPerfil(data.data); // pode ser null se não solicitou
    } catch (err) {
      console.error(err);
      setMotoristaPerfil(null);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, [usuario?.id]);

  useEffect(() => {
    if (motoristaPerfil?.statusCadastro === 'APROVADO') {
      setLoadingResumo(true);
      motoistasService
        .getRelatorio(usuario.id, hoje.getMonth() + 1, hoje.getFullYear())
        .then((dados) => setResumo(dados))
        .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar resumo.'))
        .finally(() => setLoadingResumo(false));
    }
  }, [motoristaPerfil, usuario?.id]);

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!cnhForm || cnhForm.length < 11) {
      setError('Informe uma CNH válida.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/motoristas', { usuarioId: usuario.id, cnh: cnhForm });
      await carregarPerfil();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (motoristaPerfil === undefined) {
    return (
      <div className="page animate-fade-in">
        <Loading message="Carregando perfil..." />
      </div>
    );
  }

  // --- Caso: Ainda não solicitou cadastro ---
  if (motoristaPerfil === null) {
    return (
      <div className="page animate-fade-in">
        <Header title={`Bem-vindo, ${usuario?.nome?.split(' ')[0]}!`} subtitle="Complete seu cadastro para começar a dirigir." />
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Envie sua CNH</h3>
          <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>Precisamos da sua CNH para aprovar seu cadastro como motorista.</p>
          <form onSubmit={handleSolicitar}>
            <div className="input-group">
              <label className="input-label">Número da CNH</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: 12345678901"
                value={cnhForm}
                onChange={(e) => setCnhForm(e.target.value)}
              />
            </div>
            {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Caso: Pendente ou Rejeitado ---
  if (motoristaPerfil.statusCadastro !== 'APROVADO') {
    const isPendente = motoristaPerfil.statusCadastro === 'PENDENTE';
    return (
      <div className="page animate-fade-in">
        <Header title={`Olá, ${usuario?.nome?.split(' ')[0]}`} />
        <EmptyState
          icon={<CheckCircle size={48} strokeWidth={1.5} color={isPendente ? 'var(--warning-color)' : 'var(--danger-color)'} />}
          title={isPendente ? 'Cadastro em análise' : 'Cadastro Rejeitado'}
          description={isPendente 
            ? 'Recebemos sua solicitação. O administrador analisará sua CNH em breve.' 
            : 'Sua solicitação foi rejeitada. Entre em contato com o suporte para mais informações.'}
        />
      </div>
    );
  }

  // --- Caso: Aprovado (Dashboard normal) ---
  return (
    <div className="page animate-fade-in">
      <Header
        title={`Olá, ${usuario?.nome?.split(' ')[0]}`}
        subtitle={`Resumo de ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
      />

      {loadingResumo && <Loading message="Carregando resumo..." />}
      {error && <div className="form-error" role="alert">{error}</div>}

      {!loadingResumo && !error && resumo && (
        <div className="stats-grid">
          <StatCard
            icon={<Target size={28} />}
            label="Corridas no mês"
            value={resumo.totalCorridas}
            color="primary"
          />
          <StatCard
            icon={<CheckCircle size={28} />}
            label="Concluídas"
            value={resumo.corridasConcluidas}
            color="success"
          />
          <StatCard
            icon={<Route size={28} />}
            label="Km rodados"
            value={`${resumo.kmRodados} km`}
            color="accent"
          />
          <StatCard
            icon={<DollarSign size={28} />}
            label="Valor das corridas"
            value={formatarMoeda(resumo.valorTotal)}
            color="warning"
          />
        </div>
      )}
    </div>
  );
};

export default InicioMotoristaPage;
