import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalErro from '../../components/ui/ModalErro';
import { emitirNotificacoesAtualizadas } from '../../utils/appEvents';
import veiculosService from '../../services/veiculos.service';
import { Car } from 'lucide-react';
import { formatarData } from '../../utils/formatters';

const PORTE_LABELS = { Pequeno: 'Pequeno', Medio: 'Médio', Grande: 'Grande' };

const VeiculosAnalisePage = () => {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acao, setAcao] = useState(null); // { tipo: 'aprovar' | 'rejeitar', veiculo: obj }
  const [erroModal, setErroModal] = useState({ aberto: false, titulo: 'Erro', mensagem: '' });

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await veiculosService.listarAnalise();
      setPendentes(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleConfirmarAcao = async () => {
    if (!acao) return;
    try {
      if (acao.tipo === 'aprovar') {
        await veiculosService.aprovar(acao.veiculo.id);
      } else {
        await veiculosService.rejeitar(acao.veiculo.id);
      }
      emitirNotificacoesAtualizadas();
      await carregar();
    } catch (err) {
      console.error(err);
      setErroModal({
        aberto: true,
        titulo: 'Erro',
        mensagem: err.response?.data?.message || 'Erro ao processar ação',
      });
    } finally {
      setAcao(null);
    }
  };

  return (
    <>
      <div className="page animate-fade-in">
        <Header title="Análise de Veículos" subtitle="Aprove ou rejeite veículos de motoristas" />

        {loading ? (
          <Loading message="Buscando veículos pendentes..." />
        ) : pendentes.length === 0 ? (
          <EmptyState
            icon={<Car size={32} strokeWidth={1.5} />}
            title="Nenhum veículo pendente"
            description="Não há veículos aguardando análise no momento."
          />
        ) : (
          <>
            <div className="table-wrapper table-desktop-only">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Modelo / Marca</th>
                    <th scope="col">Placa</th>
                    <th scope="col">Porte / Classe</th>
                    <th scope="col">Motorista</th>
                    <th scope="col">Data Cadastro</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendentes.map((v) => (
                    <tr key={v.id} className="data-table__row">
                      <td className="data-table__cell">{v.marca} {v.modelo}</td>
                      <td className="data-table__cell tabular-nums">{v.placa}</td>
                      <td className="data-table__cell">
                        {PORTE_LABELS[v.porte] || v.porte || '—'}{' '}
                        <Badge label={v.classe || 'N/D'} color="info" />
                      </td>
                      <td className="data-table__cell">{v.motorista?.nome || '—'}</td>
                      <td className="data-table__cell tabular-nums">{formatarData(v.criadoEm)}</td>
                      <td className="data-table__cell">
                        <Badge label="Pendente" color="warning" dot />
                      </td>
                      <td className="data-table__cell">
                        <div className="btn-group">
                          <Button type="button" size="sm" variant="success" onClick={() => setAcao({ tipo: 'aprovar', veiculo: v })}>Aprovar</Button>
                          <Button type="button" size="sm" variant="danger" onClick={() => setAcao({ tipo: 'rejeitar', veiculo: v })}>Rejeitar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards-list cards-mobile-only">
              {pendentes.map((v) => (
                <article key={v.id} className="mobile-data-card">
                  <div className="mobile-data-card__header">
                    <div>
                      <h3 className="mobile-data-card__title">{v.marca} {v.modelo}</h3>
                      <p className="mobile-data-card__subtitle tabular-nums">{v.placa}</p>
                    </div>
                    <Badge label="Pendente" color="warning" dot />
                  </div>
                  <div className="mobile-data-card__grid">
                    <div className="mobile-data-card__field">
                      <span className="mobile-data-card__label">Motorista</span>
                      <span className="mobile-data-card__value">{v.motorista?.nome || '—'}</span>
                    </div>
                    <div className="mobile-data-card__field">
                      <span className="mobile-data-card__label">Porte / Classe</span>
                      <span className="mobile-data-card__value">
                        {PORTE_LABELS[v.porte] || v.porte || '—'} • {v.classe || 'N/D'}
                      </span>
                    </div>
                    <div className="mobile-data-card__field">
                      <span className="mobile-data-card__label">Cadastro</span>
                      <span className="mobile-data-card__value tabular-nums">{formatarData(v.criadoEm)}</span>
                    </div>
                  </div>
                  <div className="mobile-data-card__actions">
                    <Button type="button" size="sm" variant="success" onClick={() => setAcao({ tipo: 'aprovar', veiculo: v })}>Aprovar</Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => setAcao({ tipo: 'rejeitar', veiculo: v })}>Rejeitar</Button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!acao && acao.tipo === 'rejeitar'}
        onClose={() => setAcao(null)}
        onConfirm={handleConfirmarAcao}
        title="Rejeitar Veículo"
        message={`Tem certeza que deseja rejeitar o veículo ${acao?.veiculo?.marca} ${acao?.veiculo?.modelo}?`}
        confirmText="Sim, Rejeitar"
        cancelText="Cancelar"
        variant="danger"
      />

      <Modal
        isOpen={!!acao && acao.tipo === 'aprovar'}
        onClose={() => setAcao(null)}
        title="Aprovar Veículo"
        size="md"
        footer={
          <div className="modal-actions">
            <Button type="button" variant="outline" onClick={() => setAcao(null)}>Cancelar</Button>
            <Button type="button" variant="success" onClick={handleConfirmarAcao}>Aprovar Veículo</Button>
          </div>
        }
      >
        {acao?.veiculo && (
          <div className="perfil-stack">
            <p className="text-secondary">
              Você está aprovando o veículo <strong>{acao.veiculo.marca} {acao.veiculo.modelo}</strong> ({acao.veiculo.placa}).
            </p>
            <div className="modal-summary" style={{ marginBottom: 0 }}>
              <div>Porte: <strong>{PORTE_LABELS[acao.veiculo.porte] || acao.veiculo.porte}</strong></div>
              <div>Classe de serviço: <strong>{acao.veiculo.classe || 'Indefinida'}</strong></div>
            </div>
            <p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>
              A classe de serviço é determinada automaticamente pelo porte do veículo.
            </p>
          </div>
        )}
      </Modal>

      <ModalErro
        isOpen={erroModal.aberto}
        onClose={() => setErroModal((prev) => ({ ...prev, aberto: false }))}
        titulo={erroModal.titulo}
        mensagem={erroModal.mensagem}
      />
    </>
  );
};

export default VeiculosAnalisePage;
