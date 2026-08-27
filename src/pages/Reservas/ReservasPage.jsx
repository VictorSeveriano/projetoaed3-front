import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import reservasService from '../../services/reservas.service';
import { formatarData, STATUS_LABELS } from '../../utils/formatters';
import { CalendarOff } from 'lucide-react';

const ReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await reservasService.listarTodas();
      setReservas(res.data || []);
    } catch { setReservas([]); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleCancelar = async (id) => {
    if (!window.confirm('Deseja cancelar esta reserva?')) return;
    setCancelando(id);
    try {
      await reservasService.cancelar(id);
      await carregar();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao cancelar reserva.');
    } finally { setCancelando(null); }
  };

  return (
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
                          loading={cancelando === r.id}
                          onClick={() => handleCancelar(r.id)}
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
  );
};

export default ReservasPage;
