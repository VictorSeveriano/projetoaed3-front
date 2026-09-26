import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import ModalErro from './ModalErro';
import Input from './Input';
import Button from './Button';
import corridasService from '../../services/corridas.service';
import { formatarMoeda } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Route, Check, TriangleAlert, Car, MapPin, Clock } from 'lucide-react';

/**
 * CorridaModal — Modal de confirmacao de solicitacao de corrida.
 *
 * Exibe:
 * - Origem e destino
 * - Rota selecionada (caminho visual, distancia, duracao)
 * - Valor estimado da corrida
 * - Seleção de classe do veículo: BASICO, NORMAL, PREMIUM
 * - Seleção de forma de pagamento: DINHEIRO, CARTAO_DEBITO, CARTAO_CREDITO, PIX
 * - Campo de data/horario desejado
 *
 * O backend valida a disponibilidade da classe e retorna erro se não houver
 * veículo disponível — exibido via ModalErro reutilizável.
 *
 * Props:
 * @param {boolean}     isOpen
 * @param {function}    onClose
 * @param {object|null} rota                - Rota selecionada pelo usuario (inclui valorEstimado)
 * @param {string}      origemNome
 * @param {string}      destinoNome
 * @param {object|null} origemGeocodificada - { lat, lng, nome } da origem geocodificada
 * @param {object|null} destinoGeocodificada- { lat, lng, nome } do destino geocodificado
 * @param {function}    onSuccess           - Callback apos corrida criada
 */
const CorridaModal = ({
  isOpen, onClose, rota, origemNome, destinoNome,
  origemGeocodificada, destinoGeocodificada, onSuccess,
}) => {
  const { usuario } = useAuth();
  const [dataHorario, setDataHorario]   = useState('');
  const [classe, setClasse]             = useState('NORMAL');
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [erroModal, setErroModal]       = useState({ open: false, mensagem: '' });

  const isDirty = dataHorario !== '';

  useEffect(() => {
    if (isOpen) {
      setDataHorario('');
      setClasse('NORMAL');
      setFormaPagamento('DINHEIRO');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // valorEstimado vem do backend. Exibido como estimativa pré-confirmação.
  const valorEstimado = rota?.valorEstimado || 0;

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
        usuarioId: usuario?.id,
        origemNome,
        destinoNome,
        origemLat: origemGeocodificada?.lat || null,
        origemLng: origemGeocodificada?.lng || null,
        destinoLat: destinoGeocodificada?.lat || null,
        destinoLng: destinoGeocodificada?.lng || null,
        rotaCaminho: rota.caminho,
        polyline: rota.polyline || null,
        distanciaKm: rota.distanciaKm,
        duracaoMin: rota.duracaoMin,
        dataHorario: new Date(dataHorario).toISOString(),
        classe,
        formaPagamento,
      });

      setSuccessMsg('Corrida solicitada com sucesso! Os motoristas elegíveis serão notificados.');
      if (onSuccess) onSuccess();
      setTimeout(() => { onClose(); setSuccessMsg(''); }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao solicitar a corrida. Tente novamente.';
      // Se for erro de disponibilidade de classe, exibir ModalErro
      if (msg.toLowerCase().includes('nao ha veiculos') || msg.toLowerCase().includes('classe')) {
        setErroModal({
          open: true,
          mensagem: 'Não há carros do tipo selecionado disponíveis para alugar. Selecione outro, por favor.',
        });
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const minDatetime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString().slice(0, 16);

  const CLASSES = [
    { value: 'BASICO',  label: 'Básico',  desc: 'Hatch ou Sedan Compacto' },
    { value: 'NORMAL',  label: 'Normal',  desc: 'Sedan Médio ou SUV Compacto' },
    { value: 'PREMIUM', label: 'Premium', desc: 'SUV Grande ou Luxo' },
  ];

  const FORMAS_PAGAMENTO = [
    { value: 'DINHEIRO',      label: 'Dinheiro' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
    { value: 'CARTAO_CREDITO',label: 'Cartão de Crédito' },
    { value: 'PIX',           label: 'PIX' },
  ];

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
                    <span>A partir de {formatarMoeda(valorEstimado)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Seleção de classe do veículo */}
            <div className="input-group" style={{ marginTop: '16px' }}>
              <label className="input-label" id="label-classe-veiculo">
                Classe do Veículo
              </label>
              <div
                role="radiogroup"
                aria-labelledby="label-classe-veiculo"
                style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}
              >
                {CLASSES.map((c) => (
                  <label
                    key={c.value}
                    htmlFor={`classe-${c.value}`}
                    style={{
                      flex: '1 1 120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 8px',
                      border: `2px solid ${classe === c.value ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: classe === c.value ? 'var(--color-primary-dim, rgba(99,102,241,0.1))' : 'var(--bg-800)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                  >
                    <input
                      id={`classe-${c.value}`}
                      type="radio"
                      name="classe"
                      value={c.value}
                      checked={classe === c.value}
                      onChange={() => setClasse(c.value)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {c.label}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {c.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seleção de forma de pagamento */}
            <div className="input-group" style={{ marginTop: '16px' }}>
              <label className="input-label" id="label-forma-pagamento">
                Forma de Pagamento
                <span
                  style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}
                >
                  (pagamento realizado presencialmente no ato da viagem)
                </span>
              </label>
              <div
                role="radiogroup"
                aria-labelledby="label-forma-pagamento"
                style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}
              >
                {FORMAS_PAGAMENTO.map((fp) => (
                  <label
                    key={fp.value}
                    htmlFor={`pagamento-${fp.value}`}
                    style={{
                      flex: '1 1 100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 8px',
                      border: `2px solid ${formaPagamento === fp.value ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: formaPagamento === fp.value ? 'var(--color-primary-dim, rgba(99,102,241,0.1))' : 'var(--bg-800)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      fontWeight: formaPagamento === fp.value ? 700 : 400,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <input
                      id={`pagamento-${fp.value}`}
                      type="radio"
                      name="formaPagamento"
                      value={fp.value}
                      checked={formaPagamento === fp.value}
                      onChange={() => setFormaPagamento(fp.value)}
                      style={{ display: 'none' }}
                    />
                    {fp.label}
                  </label>
                ))}
              </div>
            </div>

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

      {/* Modal de erro para indisponibilidade de classe */}
      <ModalErro
        isOpen={erroModal.open}
        onClose={() => setErroModal({ open: false, mensagem: '' })}
        titulo="Classe indisponível"
        mensagem={erroModal.mensagem}
      />
    </>
  );
};

export default CorridaModal;
