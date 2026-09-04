import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import corridasService from '../../services/corridas.service';
import { formatarDataHorario, formatarMoeda, STATUS_LABELS } from '../../utils/formatters';
import { CalendarOff } from 'lucide-react';

const CorridasPage = () => {
  const [corridas, setCorridas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [corridaToCancel, setCorridaToCancel] = useState(null);
  const [cancelError, setCancelError] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await corridasService.listarTodas();
      setCorridas(res || []);
    } catch { setCorridas([]); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleCancelar = async () => {
    if (!corridaToCancel) return;
    setCancelando(corridaToCancel);
    setCancelError('');
    try {
      await corridasService.cancelar(corridaToCancel);
      await carregar();
      setCorridaToCancel(null);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Erro ao cancelar corrida.');
    } finally { setCancelando(null); }
  };

  return (
    <>
    <div className="page animate-fade-in">
      <Header title="Corridas" subtitle="Gerencie as corridas solicitadas" />

      {loading ? (
        <Loading message="Carregando corridas..." />
      ) : corridas.length === 0 ? (
        <EmptyState
          icon={<CalendarOff size={48} strokeWidth={1.5} />}
          title="Nenhuma corrida encontrada"
          description="Vá até Solicitar Corrida e reserve sua primeira viagem."
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" role="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Data/Horario</th>
                <th>Distancia</th>
                <th>Valor</th>
                <th>Veiculo</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {corridas.map((c) => {
                const statusInfo = STATUS_LABELS[c.status] || { label: c.status, color: 'muted' };
                return (
                  <tr key={c.id} className="data-table__row">
                    <td className="data-table__cell">#{c.id.substring(0,6)}</td>
                    <td className="data-table__cell">{c.origemNome}</td>
                    <td className="data-table__cell">{c.destinoNome}</td>
                    <td className="data-table__cell">{formatarDataHorario(c.dataHorario)}</td>
                    <td className="data-table__cell">{c.distanciaKm} km</td>
                    <td className="data-table__cell">{formatarMoeda(c.valor)}</td>
                    <td className="data-table__cell">{c.veiculoId ? '#' + c.veiculoId : '—'}</td>
                    <td className="data-table__cell">
                      <Badge label={statusInfo.label} color={statusInfo.color} />
                    </td>
                    <td className="data-table__cell">
                      {c.status === 'CONFIRMADA' && (
                        <Button
                          id={'btn-cancelar-' + c.id}
                          variant="danger"
                          size="sm"
                          onClick={() => setCorridaToCancel(c.id)}
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
        isOpen={!!corridaToCancel}
        onClose={() => { setCorridaToCancel(null); setCancelError(''); }}
        onConfirm={handleCancelar}
        title="Cancelar corrida?"
        message={cancelError || "Tem certeza que deseja cancelar esta corrida? Essa acao não pode ser desfeita."}
        confirmText="Cancelar corrida"
        cancelText="Voltar"
        variant="danger"
        loading={!!cancelando}
      />
    </>
  );
};

export default CorridasPage;
