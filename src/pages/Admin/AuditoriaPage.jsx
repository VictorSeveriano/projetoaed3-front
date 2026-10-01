import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import auditoriaService from '../../services/auditoria.service';
import usuariosService from '../../services/usuarios.service';
import { ShieldAlert, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatarData } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const AuditoriaPage = () => {
  const { usuario } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({ usuarioId: '' });
  
  const [usuarios, setUsuarios] = useState([]);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (usuario?.perfil !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />;
  }

  const carregarUsuarios = async () => {
    try {
      const res = await usuariosService.listarTodos();
      if (res) setUsuarios(res);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

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
    carregarUsuarios();
  }, []);

  useEffect(() => {
    carregar(page, filtros);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setPage(1);
    carregar(1, filtros);
  };

  const getPerfilBadge = (perfil) => {
    if (perfil === 'ADMINISTRADOR') return <Badge label="Administrador" color="danger" />;
    if (perfil === 'MOTORISTA') return <Badge label="Motorista" color="warning" />;
    if (perfil === 'USUARIO') return <Badge label="Passageiro" color="info" />;
    return <Badge label={perfil || 'SISTEMA'} color="muted" />;
  };

  const getResultadoBadge = (resultado) => {
    if (resultado === 'SUCESSO') return <Badge label="Sucesso" color="success" />;
    if (resultado === 'FALHA') return <Badge label="Falha" color="danger" />;
    return <Badge label={resultado} color="muted" />;
  };

  return (
    <div className="page animate-fade-in">
      <Header title="Auditoria" subtitle="Acompanhe as ações realizadas no sistema" />

      {/* Ferramentas e Filtros */}
      <div className="tools-bar" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <form onSubmit={aplicarFiltros} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
          <div className="input-group" style={{ marginBottom: 0, minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <select name="usuarioId" value={filtros.usuarioId} onChange={handleFilterChange} className="input-field" style={{ paddingLeft: '40px', marginBottom: 0 }}>
                <option value="">Todos os Usuários</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} ({u.perfil})</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" variant="primary">Filtrar</Button>
          <Button type="button" variant="ghost" onClick={() => { setFiltros({ usuarioId: '' }); setPage(1); carregar(1, { usuarioId: '' }); }}>Limpar</Button>
        </form>
      </div>

      {loading ? (
        <Loading message="Buscando registros..." />
      ) : registros.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert size={48} strokeWidth={1.5} />}
          title="Nenhum evento encontrado"
          description="A auditoria não possui registros para os filtros informados."
        />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Perfil</th>
                  <th>Módulo</th>
                  <th>Ação</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id} className="data-table__row" style={{ cursor: 'pointer' }} onClick={() => { setRegistroSelecionado(r); setModalOpen(true); }}>
                    <td className="data-table__cell">{formatarData(r.criadoEm, true)}</td>
                    <td className="data-table__cell">{r.usuario?.nome || '—'}</td>
                    <td className="data-table__cell">{getPerfilBadge(r.perfil)}</td>
                    <td className="data-table__cell"><strong>{r.modulo}</strong></td>
                    <td className="data-table__cell">{r.acao}</td>
                    <td className="data-table__cell">{getResultadoBadge(r.resultado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '24px', gap: '16px' }}>
              <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} /> Anterior
              </Button>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Página {page} de {meta.totalPages} (Total: {meta.total})
              </span>
              <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>
                Próxima <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      {modalOpen && registroSelecionado && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Detalhes da Auditoria" size="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><small style={{ color: 'var(--text-muted)' }}>Data/Hora:</small><div>{formatarData(registroSelecionado.criadoEm, true)}</div></div>
              <div><small style={{ color: 'var(--text-muted)' }}>Módulo / Ação:</small><div>{registroSelecionado.modulo} / {registroSelecionado.acao}</div></div>
              <div><small style={{ color: 'var(--text-muted)' }}>Resultado:</small><div>{getResultadoBadge(registroSelecionado.resultado)}</div></div>
              <div><small style={{ color: 'var(--text-muted)' }}>Perfil Autenticado:</small><div>{getPerfilBadge(registroSelecionado.perfil)}</div></div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-800)', borderRadius: 'var(--radius-md)' }}>
              <small style={{ color: 'var(--text-muted)' }}>Usuário (Quem):</small>
              <div style={{ fontWeight: '600' }}>{registroSelecionado.usuario?.nome || 'Não identificado / Excluído'}</div>
              {registroSelecionado.usuario && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>@{registroSelecionado.usuario.usuario} | {registroSelecionado.usuario.email}</div>}
            </div>

            {registroSelecionado.entidade && (
              <div style={{ padding: '12px', background: 'var(--bg-800)', borderRadius: 'var(--radius-md)' }}>
                <small style={{ color: 'var(--text-muted)' }}>Entidade / Registro:</small>
                <div style={{ fontWeight: '600' }}>{registroSelecionado.entidade}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ID: {registroSelecionado.entidadeId || 'N/A'}</div>
              </div>
            )}

            {registroSelecionado.descricao && (
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Descrição do Evento:</small>
                <div style={{ background: 'var(--bg-900)', padding: '12px', borderRadius: 'var(--radius-sm)', marginTop: '4px', fontSize: '14px' }}>
                  {registroSelecionado.descricao}
                </div>
              </div>
            )}

            {/* Contexto Técnico / HTTP */}
            {registroSelecionado.metodoHttp && (
               <div>
                 <small style={{ color: 'var(--text-muted)' }}>Contexto HTTP:</small>
                 <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                   {registroSelecionado.metodoHttp} {registroSelecionado.rota} <br/>
                   IP: {registroSelecionado.ip || '—'} <br/>
                   Status HTTP Retornado: {registroSelecionado.statusHttp || '—'}
                 </div>
               </div>
            )}

            {(registroSelecionado.dadosAnteriores || registroSelecionado.dadosNovos) && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Payload de Alterações:</strong>
                {registroSelecionado.dadosAnteriores && (
                  <div style={{ marginBottom: '12px' }}>
                    <small style={{ color: 'var(--color-danger)' }}>Dados Anteriores:</small>
                    <pre style={{ background: 'var(--bg-900)', padding: '12px', borderRadius: '4px', fontSize: '12px', overflowX: 'auto' }}>
                      {JSON.stringify(registroSelecionado.dadosAnteriores, null, 2)}
                    </pre>
                  </div>
                )}
                {registroSelecionado.dadosNovos && (
                  <div>
                    <small style={{ color: 'var(--color-success)' }}>Dados Novos:</small>
                    <pre style={{ background: 'var(--bg-900)', padding: '12px', borderRadius: '4px', fontSize: '12px', overflowX: 'auto' }}>
                      {JSON.stringify(registroSelecionado.dadosNovos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

          </div>
          <div className="modal__footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Fechar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditoriaPage;
