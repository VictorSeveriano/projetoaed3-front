import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import auditoriaService from '../../services/auditoria.service';
import { ShieldAlert, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatarDataHorario } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const AuditoriaPage = () => {
  const { usuario } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({
    usuarioId: '',
    perfil: '',
    resultado: '',
    search: '',
    dataInicio: '',
    dataFim: '',
  });

  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const carregar = async (paginaAtual = page, filtrosAtuais = filtros) => {
    setLoading(true);
    try {
      const res = await auditoriaService.listar(filtrosAtuais, paginaAtual, 20);
      if (res && res.data) {
        setRegistros(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario?.perfil === 'ADMINISTRADOR') {
      carregar(page, filtros);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, usuario?.perfil]);

  if (usuario?.perfil !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />;
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setPage(1);
    carregar(1, filtros);
  };

  const abrirDetalhes = (r) => {
    setRegistroSelecionado(r);
    setModalOpen(true);
  };

  const getPerfilBadge = (perfil) => {
    if (perfil === 'ADMINISTRADOR') return <Badge label="Administrador" color="danger" />;
    if (perfil === 'MOTORISTA') return <Badge label="Motorista" color="warning" />;
    if (perfil === 'USUARIO') return <Badge label="Passageiro" color="info" />;
    return <Badge label={perfil || 'SISTEMA'} color="muted" />;
  };

  const getResultadoBadge = (resultado) => {
    if (resultado === 'SUCESSO') return <Badge label="Sucesso" color="success" dot />;
    if (resultado === 'FALHA') return <Badge label="Falha" color="danger" dot />;
    return <Badge label={resultado} color="muted" />;
  };

  return (
    <div className="page animate-fade-in">
      <Header title="Auditoria" subtitle="Acompanhe as ações realizadas no sistema" />

      {/* Ferramentas e Filtros */}
      <div className="tools-bar">
        <form onSubmit={aplicarFiltros} className="tools-bar__form">
          <div className="tools-bar__field--grow">
            <div className="input-with-icon">
              <span className="input-with-icon__icon" aria-hidden="true"><Search size={17} /></span>
              <input
                type="text"
                name="search"
                value={filtros.search}
                onChange={handleFilterChange}
                className="input-field"
                aria-label="Pesquisar por nome do usuário"
                placeholder="Pesquisar por nome do usuário..."
              />
            </div>
          </div>

          <div className="tools-bar__field">
            <div className="input-with-icon">
              <span className="input-with-icon__icon" aria-hidden="true"><Filter size={16} /></span>
              <select
                name="perfil"
                aria-label="Filtrar por perfil"
                value={filtros.perfil}
                onChange={handleFilterChange}
                className="input-field input-field--select"
              >
                <option value="">Todos os perfis</option>
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="MOTORISTA">Motorista</option>
                <option value="USUARIO">Passageiro</option>
              </select>
            </div>
          </div>

          <div className="tools-bar__field">
            <select
              name="resultado"
              aria-label="Filtrar por resultado"
              value={filtros.resultado}
              onChange={handleFilterChange}
              className="input-field input-field--select"
            >
              <option value="">Todos os resultados</option>
              <option value="SUCESSO">Sucesso</option>
              <option value="FALHA">Falha</option>
            </select>
          </div>

          <div className="tools-bar__field--date">
            <input
              type="date"
              name="dataInicio"
              aria-label="Data inicial"
              title="Data inicial"
              value={filtros.dataInicio}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div className="tools-bar__field--date">
            <input
              type="date"
              name="dataFim"
              aria-label="Data final"
              title="Data final"
              value={filtros.dataFim}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div className="tools-bar__actions">
            <Button type="submit" variant="primary" size="sm">Filtrar</Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const filtrosVazios = {
                  usuarioId: '',
                  perfil: '',
                  resultado: '',
                  search: '',
                  dataInicio: '',
                  dataFim: '',
                };
                setFiltros(filtrosVazios);
                setPage(1);
                carregar(1, filtrosVazios);
              }}
            >
              Limpar
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loading message="Buscando registros..." />
      ) : registros.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert size={32} strokeWidth={1.5} />}
          title="Nenhum evento encontrado"
          description="A auditoria não possui registros para os filtros informados."
        />
      ) : (
        <>
          <div className="table-wrapper table-desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Data / Hora</th>
                  <th scope="col">Usuário</th>
                  <th scope="col">Perfil</th>
                  <th scope="col">Módulo</th>
                  <th scope="col">Ação</th>
                  <th scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr
                    key={r.id}
                    className="data-table__row data-table__row--clickable"
                    tabIndex={0}
                    onClick={() => abrirDetalhes(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        abrirDetalhes(r);
                      }
                    }}
                  >
                    <td className="data-table__cell tabular-nums">{formatarDataHorario(r.criadoEm)}</td>
                    <td className="data-table__cell">{r.usuario?.nome || '—'}</td>
                    <td className="data-table__cell">{getPerfilBadge(r.perfil)}</td>
                    <td className="data-table__cell"><strong>{r.modulo}</strong></td>
                    <td className="data-table__cell text-secondary">{r.acao}</td>
                    <td className="data-table__cell">{getResultadoBadge(r.resultado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards-list cards-mobile-only">
            {registros.map((r) => (
              <article
                key={r.id}
                className="mobile-data-card mobile-data-card--clickable"
                tabIndex={0}
                onClick={() => abrirDetalhes(r)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    abrirDetalhes(r);
                  }
                }}
              >
                <div className="mobile-data-card__header">
                  <div>
                    <h3 className="mobile-data-card__title">{r.modulo} • {r.acao}</h3>
                    <p className="mobile-data-card__subtitle tabular-nums">{formatarDataHorario(r.criadoEm)}</p>
                  </div>
                  {getResultadoBadge(r.resultado)}
                </div>
                <div className="mobile-data-card__grid">
                  <div className="mobile-data-card__field">
                    <span className="mobile-data-card__label">Usuário</span>
                    <span className="mobile-data-card__value">{r.usuario?.nome || '—'}</span>
                  </div>
                  <div className="mobile-data-card__field">
                    <span className="mobile-data-card__label">Perfil</span>
                    <div>{getPerfilBadge(r.perfil)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Paginação */}
          {meta && meta.totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Paginação de auditoria">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Anterior
              </Button>
              <span className="pagination-bar__info">
                Página {page} de {meta.totalPages} (Total: {meta.total})
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                Próxima
                <ChevronRight size={16} aria-hidden="true" />
              </Button>
            </nav>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      {modalOpen && registroSelecionado && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Detalhes da Auditoria"
          size="md"
          footer={
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Fechar
              </Button>
            </div>
          }
        >
          <div className="auditoria-details">
            <div className="auditoria-meta-grid">
              <div className="auditoria-block">
                <span className="auditoria-block__label">Data / Hora</span>
                <div className="tabular-nums">{formatarDataHorario(registroSelecionado.criadoEm)}</div>
              </div>
              <div className="auditoria-block">
                <span className="auditoria-block__label">Módulo / Ação</span>
                <div>{registroSelecionado.modulo} / {registroSelecionado.acao}</div>
              </div>
              <div className="auditoria-block">
                <span className="auditoria-block__label">Resultado</span>
                <div>{getResultadoBadge(registroSelecionado.resultado)}</div>
              </div>
              <div className="auditoria-block">
                <span className="auditoria-block__label">Perfil Autenticado</span>
                <div>{getPerfilBadge(registroSelecionado.perfil)}</div>
              </div>
            </div>

            <div className="auditoria-block">
              <span className="auditoria-block__label">Usuário (Responsável)</span>
              <div style={{ fontWeight: 600 }}>{registroSelecionado.usuario?.nome || 'Não identificado / Excluído'}</div>
              {registroSelecionado.usuario && (
                <div className="text-secondary" style={{ fontSize: 'var(--font-xs)', marginTop: 2 }}>
                  @{registroSelecionado.usuario.usuario} • {registroSelecionado.usuario.email}
                </div>
              )}
            </div>

            {registroSelecionado.entidade && (
              <div className="auditoria-block">
                <span className="auditoria-block__label">Entidade / Registro</span>
                <div style={{ fontWeight: 600 }}>{registroSelecionado.entidade}</div>
                <div className="text-secondary" style={{ fontSize: 'var(--font-xs)', marginTop: 2 }}>
                  ID: {registroSelecionado.entidadeId || 'N/A'}
                </div>
              </div>
            )}

            {registroSelecionado.descricao && (
              <div className="auditoria-block">
                <span className="auditoria-block__label">Descrição do Evento</span>
                <div>{registroSelecionado.descricao}</div>
              </div>
            )}

            {registroSelecionado.metodoHttp && (
              <div className="auditoria-block">
                <span className="auditoria-block__label">Contexto HTTP</span>
                <div className="text-secondary" style={{ fontSize: 'var(--font-xs)', lineHeight: 1.6 }}>
                  {registroSelecionado.metodoHttp} {registroSelecionado.rota}<br />
                  IP: {registroSelecionado.ip || '—'}<br />
                  Status HTTP: {registroSelecionado.statusHttp || '—'}
                </div>
              </div>
            )}

            {(registroSelecionado.dadosAnteriores || registroSelecionado.dadosNovos) && (
              <div className="perfil-section">
                <strong style={{ fontSize: 'var(--font-sm)' }}>Payload de Alterações</strong>
                {registroSelecionado.dadosAnteriores && (
                  <div>
                    <small style={{ color: 'var(--color-danger-light)' }}>Dados Anteriores</small>
                    <pre className="auditoria-code">
                      {JSON.stringify(registroSelecionado.dadosAnteriores, null, 2)}
                    </pre>
                  </div>
                )}
                {registroSelecionado.dadosNovos && (
                  <div>
                    <small style={{ color: 'var(--color-success-light)' }}>Dados Novos</small>
                    <pre className="auditoria-code">
                      {JSON.stringify(registroSelecionado.dadosNovos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditoriaPage;
