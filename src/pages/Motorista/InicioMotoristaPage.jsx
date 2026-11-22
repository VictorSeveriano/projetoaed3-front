import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import motoristasService from '../../services/motoristas.service';
import { formatarMoeda } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { validarCNH } from '../../utils/validators';
import { Target, CheckCircle, Route, DollarSign, TriangleAlert } from 'lucide-react';

/**
 * InicioMotoristaPage — Página inicial do motorista.
 *
 * Exibe resumo do mês atual se APROVADO.
 * Se não houver solicitação, exibe form de CNH.
 * Se PENDENTE/REJEITADO, exibe status.
 */
const InicioMotoristaPage = () => {
  const { usuario } = useAuth();

  const [motoristaPerfil, setMotoristaPerfil] = useState(undefined); // undefined = loading
  const [cnhForm, setCnhForm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [resumo, setResumo] = useState(null);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [error, setError] = useState('');

  const carregarDados = useCallback(async ({ forcar = false } = {}) => {
    if (!usuario?.id) return;
    const hoje = new Date();
    setLoadingResumo(true);
    setError('');

    // Carrega perfil e relatório mensal em paralelo para eliminar waterfall sequencial
    const [perfilRes, relatorioRes] = await Promise.allSettled([
      motoristasService.buscarPorUsuarioId(usuario.id, { forcar }),
      motoristasService.getRelatorio(usuario.id, hoje.getMonth() + 1, hoje.getFullYear(), { forcar }),
    ]);

    const perfil = perfilRes.status === 'fulfilled' ? perfilRes.value : null;
    if (perfilRes.status === 'rejected') {
      console.error(perfilRes.reason);
    }
    setMotoristaPerfil(perfil);

    if (perfil?.statusCadastro === 'APROVADO') {
      if (relatorioRes.status === 'fulfilled') {
        setResumo(relatorioRes.value);
      } else {
        setError(relatorioRes.reason?.response?.data?.message || 'Erro ao carregar resumo.');
      }
    } else {
      setResumo(null);
    }
    setLoadingResumo(false);
  }, [usuario?.id]);

  useEffect(() => {
    let ativo = true;
    const iniciar = async () => {
      if (!usuario?.id) return;
      const hoje = new Date();
      setLoadingResumo(true);
      setError('');

      const [perfilRes, relatorioRes] = await Promise.allSettled([
        motoristasService.buscarPorUsuarioId(usuario.id),
        motoristasService.getRelatorio(usuario.id, hoje.getMonth() + 1, hoje.getFullYear()),
      ]);

      if (!ativo) return;

      const perfil = perfilRes.status === 'fulfilled' ? perfilRes.value : null;
      if (perfilRes.status === 'rejected') {
        console.error(perfilRes.reason);
      }
      setMotoristaPerfil(perfil);

      if (perfil?.statusCadastro === 'APROVADO') {
        if (relatorioRes.status === 'fulfilled') {
          setResumo(relatorioRes.value);
        } else {
          setError(relatorioRes.reason?.response?.data?.message || 'Erro ao carregar resumo.');
        }
      } else {
        setResumo(null);
      }
      setLoadingResumo(false);
    };

    iniciar();
    return () => {
      ativo = false;
    };
  }, [usuario?.id]);

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!cnhForm || !validarCNH(cnhForm)) {
      setError('Informe uma CNH válida (11 dígitos, apenas números).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await motoristasService.solicitar({ cnh: cnhForm });
      await carregarDados({ forcar: true });
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
        <div className="card form-card-centered form-card-centered--sm">
          <div className="card__header">
            <h2 className="card-section-title">Envie sua CNH</h2>
          </div>
          <div className="card__body">
            <p className="text-secondary" style={{ marginBottom: 20 }}>
              Precisamos do número da sua CNH para aprovar seu cadastro como motorista.
            </p>
            <form onSubmit={handleSolicitar} className="login-form">
              <Input
                id="input-cnh-solicitacao"
                label="Número da CNH"
                required
                type="text"
                placeholder="Ex: 12345678901"
                hint="Informe os 11 dígitos numéricos da sua habilitação."
                value={cnhForm}
                onChange={(e) => {
                  setError('');
                  setCnhForm(e.target.value);
                }}
              />
              {error && (
                <div className="form-error" role="alert">
                  <TriangleAlert size={16} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
                Enviar Solicitação
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Caso: Pendente ou Rejeitado ---
  if (motoristaPerfil.statusCadastro !== 'APROVADO') {
    const isPendente = motoristaPerfil.statusCadastro === 'PENDENTE';
    return (
      <div className="page animate-fade-in">
        <Header title={`Olá, ${usuario?.nome?.split(' ')[0]}`} subtitle="Status da sua solicitação de motorista" />
        <EmptyState
          icon={<CheckCircle size={32} strokeWidth={1.5} color={isPendente ? 'var(--color-warning-light)' : 'var(--color-danger-light)'} />}
          title={isPendente ? 'Cadastro em análise' : 'Cadastro Rejeitado'}
          description={
            isPendente
              ? 'Sua CNH ainda aguarda aprovação de um administrador. O cadastro do veículo ficará disponível após a aprovação do perfil. Você só poderá receber e aceitar corridas quando o perfil e o veículo estiverem aprovados.'
              : 'Sua solicitação foi rejeitada. Entre em contato com o suporte para mais informações.'
          }
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
      {error && (
        <div className="form-error" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!loadingResumo && !error && resumo && (
        <div className="stats-grid">
          <StatCard
            icon={<DollarSign size={22} />}
            label="Valor das corridas"
            value={formatarMoeda(resumo.valorTotal)}
            color="success"
            featured
          />
          <StatCard
            icon={<Target size={22} />}
            label="Corridas no mês"
            value={resumo.totalCorridas}
            color="primary"
          />
          <StatCard
            icon={<CheckCircle size={22} />}
            label="Concluídas"
            value={resumo.corridasConcluidas}
            color="warning"
          />
          <StatCard
            icon={<Route size={22} />}
            label="Km rodados"
            value={`${resumo.kmRodados} km`}
            color="accent"
          />
        </div>
      )}
    </div>
  );
};

export default InicioMotoristaPage;
