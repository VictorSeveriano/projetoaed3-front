import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import Input from './Input';
import Button from './Button';
import corridasService from '../../services/corridas.service';
import { formatarMoeda } from '../../utils/formatters';
import { Route, Check, TriangleAlert, Car, MapPin, Clock } from 'lucide-react';

/**
 * CorridaModal — Modal de confirmacao de solicitacao de corrida.
 *
 * Exibe:
 * - Origem e destino
 * - Rota selecionada (caminho visual, distancia, duracao)
 * - Valor estimado da corrida
 * - Campo de data/horario desejado
 *
 * Ao confirmar, cria a corrida via POST /api/corridas.
 *
 * Props:
 * @param {boolean}     isOpen
 * @param {function}    onClose
 * @param {object|null} rota       - Rota selecionada pelo usuario
 * @param {string}      origemNome
 * @param {string}      destinoNome
 * @param {function}    onSuccess  - Callback apos corrida criada
 */
const CorridaModal = ({ isOpen, onClose, rota, origemNome, destinoNome, onSuccess }) => {
  const [dataHorario, setDataHorario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isDirty = dataHorario !== '';

  useEffect(() => {
    if (isOpen) {
      setDataHorario('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Valor estimado: tarifa base de Sedan (R$4/km) como default
  const valorEstimado = rota ? parseFloat((rota.distanciaKm * 4.0).toFixed(2)) : 0;

  const handleCloseRequest = () => {
    if (isDirty && !successMsg && !loading) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmarCorrida = async () => {
    if (!dataHorario) {
      setError('Informe a data e horario desejado para a corrida.');
      return;
    }
    if (!rota) { setError('Selecione uma rota primeiro.'); return; }

    setLoading(true); setError('');
    try {
      await corridasService.criar({
        usuarioId: '1',
        origemNome,
        destinoNome,
        rotaCaminho: rota.caminho,
        distanciaKm: rota.distanciaKm,
        duracaoMin: rota.duracaoMin,
        dataHorario: new Date(dataHorario).toISOString(),
      });

      setSuccessMsg('Corrida solicitada com sucesso!');
      if (onSuccess) onSuccess();
      setTimeout(() => { onClose(); setSuccessMsg(''); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao solicitar a corrida. Tente novamente.');
    } finally { setLoading(false); }
  };

  const minDatetime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString().slice(0, 16);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseRequest}
        title="Confirmar Corrida"
        size="lg"
        footer={
          !successMsg && (
            <div className="reserva-form__actions">
              <Button variant="ghost" onClick={handleCloseRequest}>Cancelar</Button>
              <Button id="btn-confirmar-corrida" onClick={confirmarCorrida} loading={loading}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} aria-hidden="true" />
                  Confirmar Corrida
                </span>
              </Button>
            </div>
          )
        }
      >
        {successMsg ? (
          <div className="success-banner">{successMsg}</div>
        ) : (
          <div className="reserva-form">
            {/* Resumo do trajeto */}
            {rota && (
              <div className="corrida-resumo">
                <div className="corrida-resumo__row">
                  <MapPin size={14} aria-hidden="true" />
                  <span className="corrida-resumo__label">Origem:</span>
                  <span className="corrida-resumo__valor">{origemNome}</span>
                </div>
                <div className="corrida-resumo__row">
                  <MapPin size={14} aria-hidden="true" />
                  <span className="corrida-resumo__label">Destino:</span>
                  <span className="corrida-resumo__valor">{destinoNome}</span>
                </div>

                {/* Caminho visual */}
                <div className="corrida-caminho">
                  {rota.caminho.map((loc, i) => (
                    <span key={i} className="corrida-caminho__step">
                      {i > 0 && <span className="corrida-caminho__arrow" aria-hidden="true">-&gt;</span>}
                      <span className="corrida-caminho__loc">{loc}</span>
                    </span>
                  ))}
                </div>

                <div className="corrida-metrics">
                  <div className="corrida-metric">
                    <Route size={14} aria-hidden="true" />
                    <span>{rota.distanciaFormatada}</span>
                  </div>
                  <div className="corrida-metric">
                    <Clock size={14} aria-hidden="true" />
                    <span>{rota.duracaoFormatada}</span>
                  </div>
                  <div className="corrida-metric corrida-metric--valor">
                    <Car size={14} aria-hidden="true" />
                    <span>Estimado: {formatarMoeda(valorEstimado)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Data e horario */}
            <Input
              id="input-data-horario"
              name="dataHorario"
              label="Data e Horario da Corrida"
              type="datetime-local"
              value={dataHorario}
              min={minDatetime}
              onChange={(e) => setDataHorario(e.target.value)}
            />

            {error && (
              <div className="form-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TriangleAlert size={16} aria-hidden="true" />
                {error}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => { setShowExitConfirm(false); onClose(); }}
        title="Sair sem confirmar?"
        message="Voce preencheu dados nesta corrida. Se sair agora, os dados serao perdidos."
        confirmText="Sair sem confirmar"
        cancelText="Continuar preenchendo"
        variant="warning"
      />
    </>
  );
};

export default CorridaModal;
