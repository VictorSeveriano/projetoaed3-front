import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import reservasService from '../../services/reservas.service';
import { formatarData, STATUS_LABELS } from '../../utils/formatters';
import { CalendarOff } from 'lucide-react';

const ReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [reservaToCancel, setReservaToCancel] = useState(null);
  const [cancelError, setCancelError] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await reservasService.listarTodas();
      setReservas(res.data || []);
    } catch { setReservas([]); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleCancelar = async () => {
    if (!reservaToCancel) return;
    setCancelando(reservaToCancel);
    setCancelError('');
    try {
      await reservasService.cancelar(reservaToCancel);
      await carregar();
      setReservaToCancel(null);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Erro ao cancelar reserva.');
    } finally { setCancelando(null); }
  };

  return (
    <>
    <div className="page animate-fade-in">
      <Header title="Reservas" subtitle="Gerencie todas as reservas do sistema" />

      {loading ? (
        <Loading message="Carregando reservas..." />
      ) : reservas.length === 0 ? (
        <EmptyState
          icon={<CalendarOff size={48} strokeWidth={1.5} />}
          title="Nenhuma reserva encontrada"
          description="Vá até Carros e realize sua primeira reserva."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" role="table">
            <thead>
              <tr>
                <th>Carro ID</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Retirada</th>
                <th>Devolução</th>
                <th>Rota (km)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => {
                const statusInfo = STATUS_LABELS[r.status] || { label: r.status, color: 'muted' };
                return (
                  <tr key={r.id} className="data-table__row">
                    <td className="data-table__cell">#{r.carroId}</td>
                    <td className="data-table__cell">{formatarData(r.dataInicio)}</td>
                    <td className="data-table__cell">{formatarData(r.dataFim)}</td>
                    <td className="data-table__cell">{r.localRetirada}</td>
                    <td className="data-table__cell">{r.localDevolucao}</td>
                    <td className="data-table__cell">
                      {r.rota ? (
                        <span className="rota-chip" title={r.rota.caminho?.join(' → ')}>
                          {r.rota.distanciaTotal} km
                        </span>
                      ) : '—'}
                    </td>
                    <td className="data-table__cell">
                      <Badge label={statusInfo.label} color={statusInfo.color} />
                    </td>
                    <td className="data-table__cell">
                      {r.status === 'ATIVA' && (
                        <Button
                          id={`btn-cancelar-${r.id}`}
                          variant="danger"
                          size="sm"
                          onClick={() => setReservaToCancel(r.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
      
      <ConfirmationModal
        isOpen={!!reservaToCancel}
        onClose={() => { setReservaToCancel(null); setCancelError(''); }}
        onConfirm={handleCancelar}
        title="Cancelar reserva?"
        message={cancelError || "Tem certeza que deseja cancelar esta reserva? Essa ação poderá não ser desfeita."}
        confirmText="Cancelar reserva"
        cancelText="Voltar"
        variant="danger"
        loading={!!cancelando}
      />
    </>
  );
};

export default ReservasPage;
