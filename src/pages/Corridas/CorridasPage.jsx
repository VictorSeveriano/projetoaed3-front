import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import CorridasTabs from '../../components/ui/CorridasTabs';
import CorridasFiltrosAvancados from '../../components/ui/corridas/CorridasFiltrosAvancados';
import corridasService from '../../services/corridas.service';
import { APP_EVENTS, escutarEvento } from '../../utils/appEvents';
import {
  FILTROS_CORRIDA_INICIAIS,
  lerFiltrosDeSearchParams,
  serializarFiltrosParaQuery,
  contarFiltrosAtivos,
} from '../../utils/indicadorAtrasoCorrida';
import { formatarMoeda } from '../../utils/formatters';
import {
  Activity,
  History,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ESCOPOS_VISAO = [
  {
    key: 'ATIVAS',
    label: 'Em acompanhamento',
    icone: <Activity size={16} aria-hidden="true" />,
  },
  {
    key: 'HISTORICO',
    label: 'Histórico de corridas',
    icone: <History size={16} aria-hidden="true" />,
  },
  {
    key: 'TODAS',
    label: 'Visão geral',
    icone: <Layers size={16} aria-hidden="true" />,
  },
];

const ITENS_POR_PAGINA = 15;

/**
 * CorridasPage — Acompanhamento operacional e Histórico detalhado de corridas,
 * com separação clara entre corridas ativas e histórico encerrado, filtros avançados
 * combináveis, paginação no servidor, linha do tempo sob demanda e exportação CSV/PDF.
 */
const CorridasPage = ({ escopoPadrao = 'ATIVAS' }) => {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const escopoUrl = searchParams.get('escopo');
  const escopoAtivo = ['ATIVAS', 'HISTORICO', 'TODAS'].includes(escopoUrl)
    ? escopoUrl
    : escopoPadrao;

  const pageAtiva = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const ordenarPor = searchParams.get('ordenarPor') || 'dataHorario';
  const direcao = searchParams.get('direcao') || 'desc';
  const filtrosAtivos = useMemo(() => lerFiltrosDeSearchParams(searchParams), [searchParams]);

  const [corridas, setCorridas] = useState([]);
  const [carrosMap, setCarrosMap] = useState({});
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [exportandoFormato, setExportandoFormato] = useState('');
  const [erroExportacao, setErroExportacao] = useState('');

  const atualizarUrlParams = useCallback(
    (novosFiltros, opcoesExtras = {}) => {
      const proximoEscopo = opcoesExtras.escopo ?? escopoAtivo;
      const proximaPagina = opcoesExtras.page ?? 1;
      const proximoOrdenar = opcoesExtras.ordenarPor ?? ordenarPor;
      const proximaDirecao = opcoesExtras.direcao ?? direcao;

      const params = serializarFiltrosParaQuery(novosFiltros, {
        escopo: proximoEscopo !== escopoPadrao ? proximoEscopo : undefined,
        page: proximaPagina > 1 ? proximaPagina : undefined,
        ordenarPor: proximoOrdenar !== 'dataHorario' ? proximoOrdenar : undefined,
        direcao: proximaDirecao !== 'desc' ? proximaDirecao : undefined,
      });
      setSearchParams(params, { replace: true });
    },
    [escopoAtivo, escopoPadrao, ordenarPor, direcao, setSearchParams]
  );

  const carregar = useCallback(
    async ({ forcar = false } = {}) => {
      if (!usuario?.id) return;
      setLoading(true);
      setError('');
      try {
        const resposta = await corridasService.consultarHistorico(filtrosAtivos, {
          page: pageAtiva,
          limit: ITENS_POR_PAGINA,
          ordenarPor,
          direcao,
          escopo: escopoAtivo,
          forcar,
        });

        const lista = resposta?.data || [];
        setCorridas(lista);
        setMeta(resposta?.meta || null);

        const mapa = {};
        lista.forEach((c) => {
          if (c.veiculo && c.veiculoId) {
            mapa[c.veiculoId] = c.veiculo;
          }
        });
        setCarrosMap(mapa);
      } catch (err) {
        setError(err?.response?.data?.message || 'Erro ao carregar corridas.');
        setCorridas([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    [usuario?.id, filtrosAtivos, pageAtiva, ordenarPor, direcao, escopoAtivo]
  );

  const recarregarForcado = useCallback(() => carregar({ forcar: true }), [carregar]);

  useEffect(() => {
    carregar({ forcar: false });
  }, [carregar]);

  useEffect(() => {
    const offCorridas = escutarEvento(APP_EVENTS.CORRIDAS_ATUALIZADAS, recarregarForcado);
    const offNotif = escutarEvento(APP_EVENTS.NOTIFICACOES_ATUALIZADAS, recarregarForcado);
    return () => {
      offCorridas();
      offNotif();
    };
  }, [recarregarForcado]);

  const handleTrocarEscopo = (novoEscopo) => {
    // Limpa filtros de status incompatíveis ao alternar entre acompanhamento e histórico
    const filtrosAjustados = { ...filtrosAtivos };
    if (novoEscopo === 'ATIVAS' && ['FINALIZADA', 'CANCELADA'].includes(filtrosAjustados.status)) {
      filtrosAjustados.status = '';
    }
    if (novoEscopo === 'HISTORICO' && ['SOLICITADA', 'CONFIRMADA', 'EM_ANDAMENTO'].includes(filtrosAjustados.status)) {
      filtrosAjustados.status = '';
    }
    atualizarUrlParams(filtrosAjustados, { escopo: novoEscopo, page: 1 });
  };

  const handleAplicarFiltros = (novosFiltros) => {
    atualizarUrlParams(novosFiltros, { page: 1 });
  };

  const handleRemoverFiltroIndividual = (chave) => {
    const proximo = {
      ...filtrosAtivos,
      [chave]: typeof filtrosAtivos[chave] === 'boolean' ? false : '',
    };
    atualizarUrlParams(proximo, { page: 1 });
  };

  const handleLimparFiltros = () => {
    atualizarUrlParams({ ...FILTROS_CORRIDA_INICIAIS }, { page: 1 });
  };

  const handleAlterarOrdenacao = (novoCampo, novaDirecao) => {
    atualizarUrlParams(filtrosAtivos, {
      ordenarPor: novoCampo,
      direcao: novaDirecao,
      page: 1,
    });
  };

  const handleMudarPagina = (novaPagina) => {
    atualizarUrlParams(filtrosAtivos, { page: novaPagina });
  };

  const handleExportar = async (formato) => {
    setErroExportacao('');
    setExportandoFormato(formato);
    try {
      await corridasService.exportarRelatorio(formato, filtrosAtivos, {
        escopo: escopoAtivo,
        ordenarPor,
        direcao,
      });
    } catch (err) {
      setErroExportacao(err?.message || 'Não foi possível exportar o relatório.');
    } finally {
      setExportandoFormato('');
    }
  };

  const isAdmin = usuario?.perfil === 'ADMINISTRADOR';
  const isMotorista = usuario?.perfil === 'MOTORISTA';
  const isUsuario = usuario?.perfil === 'USUARIO';

  const ehModoHistorico = escopoAtivo === 'HISTORICO';
  const tituloPagina = ehModoHistorico ? 'Histórico de Corridas' : 'Corridas';
  const subtitulo = ehModoHistorico
    ? isAdmin
      ? 'Consulte o histórico detalhado, linha do tempo e relatórios de todas as corridas encerradas'
      : isMotorista
        ? 'Consulte suas corridas concluídas ou canceladas, horários efetivos e linha do tempo'
        : 'Acompanhe suas corridas anteriores, detalhes da viagem e acontecimentos registrados'
    : isAdmin
      ? 'Gerencie o andamento, pontualidade e histórico das corridas em todos os perfis'
      : isMotorista
        ? 'Suas corridas — acompanhe o embarque e confirme o pagamento ao finalizar'
        : 'Acompanhe suas solicitações ativas, pontualidade e detalhes de embarque';

  const resumo = meta?.resumo;
  const possuiFiltrosAtivos = contarFiltrosAtivos(filtrosAtivos) > 0;

  const emptyTitle = possuiFiltrosAtivos
    ? 'Nenhuma corrida corresponde aos filtros aplicados'
    : ehModoHistorico
      ? 'Nenhum registro no histórico'
      : escopoAtivo === 'ATIVAS'
        ? 'Nenhuma corrida ativa no momento'
        : 'Nenhuma corrida encontrada';

  const emptyDescription = possuiFiltrosAtivos
    ? 'Ajuste ou limpe os filtros avançados acima para ampliar os resultados da pesquisa.'
    : ehModoHistorico
      ? 'Corridas finalizadas, canceladas ou expiradas aparecerão organizadas aqui com sua linha do tempo completa.'
      : escopoAtivo === 'ATIVAS'
        ? 'Não há corridas solicitadas, confirmadas ou em andamento neste momento. Consulte a aba "Histórico de corridas" para ver viagens anteriores.'
        : 'Você ainda não possui corridas registradas.';

  return (
    <div className="page animate-fade-in">
      <Header title={tituloPagina} subtitle={subtitulo} />

      {/* Navegação clara entre Corridas em acompanhamento x Histórico encerrado */}
      <div className="corridas-tabs" role="tablist" aria-label="Selecionar visão de corridas">
        {ESCOPOS_VISAO.map((visao) => (
          <button
            key={visao.key}
            id={`tab-escopo-${visao.key.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={escopoAtivo === visao.key}
            className={`corridas-tab ${escopoAtivo === visao.key ? 'corridas-tab--ativa' : ''}`.trim()}
            onClick={() => handleTrocarEscopo(visao.key)}
          >
            {visao.icone}
            <span>{visao.label}</span>
          </button>
        ))}
      </div>

      {/* Resumo consolidado da consulta atual */}
      {resumo && !loading && (
        <div className="stats-grid corridas-resumo-grid">
          <StatCard
            icon={<Layers size={20} />}
            label="Total na consulta"
            value={resumo.total}
            color="primary"
          />
          {escopoAtivo === 'ATIVAS' ? (
            <StatCard
              icon={<Clock size={20} />}
              label="Em atraso"
              value={resumo.atrasadas}
              color={resumo.atrasadas > 0 ? 'danger' : 'success'}
            />
          ) : (
            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Finalizadas"
              value={resumo.finalizadas}
              color="success"
            />
          )}
          <StatCard
            icon={<XCircle size={20} />}
            label={escopoAtivo === 'ATIVAS' ? 'Ativas agora' : 'Canceladas / Expiradas'}
            value={
              escopoAtivo === 'ATIVAS'
                ? resumo.ativas
                : `${resumo.canceladas} (${resumo.expiradas} exp.)`
            }
            color={escopoAtivo === 'ATIVAS' ? 'accent' : 'warning'}
          />
          <StatCard
            icon={<DollarSign size={20} />}
            label={ehModoHistorico ? 'Valor finalizado' : 'Valor registrado'}
            value={formatarMoeda(
              ehModoHistorico ? resumo.valorTotalFinalizado : resumo.valorTotalRegistrado
            )}
            color="success"
          />
        </div>
      )}

      {/* Barra de filtros avançados retráteis, ordenação e exportação CSV/PDF */}
      <CorridasFiltrosAvancados
        perfil={usuario?.perfil}
        filtrosAplicados={filtrosAtivos}
        ordenarPor={ordenarPor}
        direcao={direcao}
        exportandoFormato={exportandoFormato}
        erroExportacao={erroExportacao}
        onAplicarFiltros={handleAplicarFiltros}
        onRemoverFiltroIndividual={handleRemoverFiltroIndividual}
        onLimparFiltros={handleLimparFiltros}
        onAlterarOrdenacao={handleAlterarOrdenacao}
        onExportar={handleExportar}
      />

      {/* Tabela / Cards responsivos + modais de ação e linha do tempo */}
      <CorridasTabs
        corridas={corridas}
        carrosMap={carrosMap}
        loading={loading}
        error={error}
        podeCancelar={isAdmin || isUsuario || isMotorista}
        podeFinalizar={isAdmin}
        podeConfirmarPagamento={isMotorista}
        perfil={usuario?.perfil}
        ocultarAbasLocais
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onAcao={recarregarForcado}
      />

      {/* Paginação server-side */}
      {!loading && !error && meta && meta.totalPages > 1 && (
        <nav className="pagination-bar" aria-label="Paginação de corridas">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleMudarPagina(Math.max(1, pageAtiva - 1))}
            disabled={pageAtiva <= 1}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Anterior
          </Button>
          <span className="pagination-bar__info tabular-nums">
            Página {meta.page} de {meta.totalPages} ({meta.total} corridas)
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleMudarPagina(Math.min(meta.totalPages, pageAtiva + 1))}
            disabled={pageAtiva >= meta.totalPages}
          >
            Próxima
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  );
};

export default CorridasPage;
