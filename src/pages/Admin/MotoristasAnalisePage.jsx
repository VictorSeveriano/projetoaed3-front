import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalErro from '../../components/ui/ModalErro';
import motoristasService from '../../services/motoristas.service';
import { emitirNotificacoesAtualizadas } from '../../utils/appEvents';
import { UserCheck } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const MotoristasAnalisePage = () => {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState(null); // { tipo: 'aprovar' | 'rejeitar', motorista: obj }
  const [erroModal, setErroModal] = useState({ aberto: false, titulo: 'Erro', mensagem: '' });

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await motoristasService.listarAnalise();
      setPendentes(res || []);
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Erro',
        mensagem: err.response?.data?.message || 'Erro ao carregar solicitações de motoristas.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleConfirmarAcao = async () => {
    if (!acao) return;
    try {
      if (acao.tipo === 'aprovar') {
        await motoristasService.aprovar(acao.motorista.id);
      } else {
        await motoristasService.rejeitar(acao.motorista.id);
      }
      emitirNotificacoesAtualizadas();
      await carregar();
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Erro',
        mensagem: err.response?.data?.message || 'Erro ao processar ação.',
      });
    } finally {
      setAcao(null);
    }
  };

  return (
    <>
      <div className="page animate-fade-in">
        <Header title="Análise de Motoristas" subtitle="Aprove ou rejeite solicitações de cadastro" />

        {loading ? (
          <Loading message="Buscando solicitações..." />
        ) : pendentes.length === 0 ? (
          <EmptyState
            icon={<UserCheck size={32} strokeWidth={1.5} />}
            title="Tudo em dia!"
            description="Não há nenhuma solicitação pendente no momento."
          />
        ) : (
          <>
            <div className="table-wrapper table-desktop-only">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Usuário</th>
                    <th scope="col">CNH</th>
                    <th scope="col">Data Solicitação</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendentes.map((m) => (
                    <tr key={m.id} className="data-table__row">
                      <td className="data-table__cell">{m.usuario?.nome || '—'}</td>
                      <td className="data-table__cell text-secondary">@{m.usuario?.usuario || '—'}</td>
                      <td className="data-table__cell tabular-nums">{m.cnh}</td>
                      <td className="data-table__cell tabular-nums">{formatarData(m.criadoEm)}</td>
                      <td className="data-table__cell">
                        <Badge label="Pendente" color="warning" dot />
                      </td>
                      <td className="data-table__cell">
                        <div className="btn-group">
                          <Button type="button" size="sm" variant="success" onClick={() => setAcao({ tipo: 'aprovar', motorista: m })}>Aprovar</Button>
                          <Button type="button" size="sm" variant="danger" onClick={() => setAcao({ tipo: 'rejeitar', motorista: m })}>Rejeitar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards-list cards-mobile-only">
              {pendentes.map((m) => (
                <article key={m.id} className="mobile-data-card">
                  <div className="mobile-data-card__header">
                    <div>
                      <h3 className="mobile-data-card__title">{m.usuario?.nome || '—'}</h3>
                      <p className="mobile-data-card__subtitle">@{m.usuario?.usuario || '—'}</p>
                    </div>
                    <Badge label="Pendente" color="warning" dot />
                  </div>
                  <div className="mobile-data-card__grid">
                    <div className="mobile-data-card__field">
                      <span className="mobile-data-card__label">CNH</span>
                      <span className="mobile-data-card__value tabular-nums">{m.cnh}</span>
                    </div>
                    <div className="mobile-data-card__field">
                      <span className="mobile-data-card__label">Solicitação</span>
                      <span className="mobile-data-card__value tabular-nums">{formatarData(m.criadoEm)}</span>
                    </div>
                  </div>
                  <div className="mobile-data-card__actions">
                    <Button type="button" size="sm" variant="success" onClick={() => setAcao({ tipo: 'aprovar', motorista: m })}>Aprovar</Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => setAcao({ tipo: 'rejeitar', motorista: m })}>Rejeitar</Button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!acao}
        onClose={() => setAcao(null)}
        onConfirm={handleConfirmarAcao}
        title={acao?.tipo === 'aprovar' ? 'Aprovar Motorista' : 'Rejeitar Motorista'}
        message={`Tem certeza que deseja ${acao?.tipo} a solicitação de ${acao?.motorista?.usuario?.nome}?`}
        confirmText={acao?.tipo === 'aprovar' ? 'Sim, Aprovar' : 'Sim, Rejeitar'}
        cancelText="Cancelar"
        variant={acao?.tipo === 'aprovar' ? 'primary' : 'danger'}
      />

      <ModalErro
        isOpen={erroModal.aberto}
        onClose={() => setErroModal((prev) => ({ ...prev, aberto: false }))}
        titulo={erroModal.titulo}
        mensagem={erroModal.mensagem}
      />
    </>
  );
};

export default MotoristasAnalisePage;
